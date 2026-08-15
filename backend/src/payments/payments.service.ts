import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { createHash } from 'crypto';

import {
  Order, PaymentMode, PaymentStatus,
} from '../commerce/models/order.model';
import {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from './models/payment-transaction.model';
import { Refund, RefundStatus } from './models/refund.model';
import { PaymentWebhookEvent } from './models/payment-webhook-event.model';
import {
  CreateRefundDto, ManualPaymentDto, TransactionStatusDto, UpdateRefundDto,
} from './dto/payment-ledger.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order) private readonly orderModel:typeof Order,
    @InjectModel(PaymentTransaction) private readonly txModel:typeof PaymentTransaction,
    @InjectModel(Refund) private readonly refundModel:typeof Refund,
    @InjectModel(PaymentWebhookEvent) private readonly webhookModel:typeof PaymentWebhookEvent,
    private readonly sequelize:Sequelize,
  ) {}

  private async order(id:string){
    const row=await this.orderModel.findByPk(id);
    if(!row) throw new NotFoundException('Order not found.');
    return row;
  }

  async recalculate(orderId:string,t?:any){
    const order=await this.order(orderId);
    const verified=await this.txModel.findAll({
      where:{orderId,status:PaymentTransactionStatus.VERIFIED},
      transaction:t,
    });
    const refunds=await this.refundModel.findAll({
      where:{orderId,status:RefundStatus.COMPLETED},
      transaction:t,
    });

    const paid=verified
      .filter(x=>x.type!==PaymentTransactionType.REFUND)
      .reduce((s,x)=>s+Number(x.amount||0),0);

    const refunded=refunds.reduce((s,x)=>s+Number(x.amount||0),0);
    const net=Math.max(0,paid-refunded);
    const total=Number(order.total||0);

    if(net<=0){
      order.paymentStatus=PaymentStatus.UNPAID;
    }else if(net+0.005>=total){
      order.paymentStatus=refunded>=paid&&paid>0?PaymentStatus.REFUNDED:PaymentStatus.PAID;
    }else{
      order.paymentStatus=PaymentStatus.PARTIAL;
    }

    await order.save({transaction:t});
    return {
      total,
      paid,
      refunded,
      netPaid:net,
      due:Math.max(0,total-net),
      paymentStatus:order.paymentStatus,
    };
  }

  async ledger(orderId:string,userId?:string,admin=false){
    const order=await this.order(orderId);
    if(!admin&&userId&&order.userId!==userId) throw new NotFoundException('Order not found.');

    const [transactions,refunds,summary]=await Promise.all([
      this.txModel.findAll({where:{orderId},order:[['createdAt','DESC']]}),
      this.refundModel.findAll({where:{orderId},order:[['createdAt','DESC']]}),
      this.recalculate(orderId),
    ]);

    return {
      order:{
        id:order.id,
        orderNumber:order.orderNumber,
        total:Number(order.total),
        paymentMode:order.paymentMode,
        paymentStatus:order.paymentStatus,
      },
      summary,
      transactions,
      refunds,
    };
  }

  async createInitialForOrder(order:Order,actorId?:string){
    if(order.paymentMode===PaymentMode.COD) return null;
    const existing=await this.txModel.findOne({
      where:{orderId:order.id,type:PaymentTransactionType.CHARGE,status:PaymentTransactionStatus.PENDING},
    });
    if(existing)return existing;

    const amount=order.paymentMode===PaymentMode.PARTIAL
      ? Math.max(1,Math.round(Number(order.total)*0.20*100)/100)
      : Number(order.total);

    return this.txModel.create({
      orderId:order.id,
      userId:order.userId,
      provider:'UNCONFIGURED_GATEWAY',
      type:order.paymentMode===PaymentMode.PARTIAL
        ?PaymentTransactionType.PARTIAL_PAYMENT
        :PaymentTransactionType.CHARGE,
      status:PaymentTransactionStatus.PENDING,
      amount,
      currency:'BDT',
      createdBy:actorId||order.userId,
      providerPayload:{
        note:'Gateway intent placeholder. Do not mark paid until provider verification.',
      },
    } as any);
  }

  async manualPayment(dto:ManualPaymentDto,actorId:string){
    const order=await this.order(dto.orderId);
    const amount=Number(dto.amount);
    const current=await this.recalculate(order.id);
    if(amount>current.due+0.005) throw new BadRequestException(`Amount exceeds due balance BDT ${current.due}.`);

    if(dto.idempotencyKey){
      const existing=await this.txModel.findOne({where:{idempotencyKey:dto.idempotencyKey}});
      if(existing)return this.ledger(order.id,undefined,true);
    }

    await this.sequelize.transaction(async t=>{
      await this.txModel.create({
        orderId:order.id,
        userId:order.userId,
        provider:(dto.provider||'MANUAL').toUpperCase(),
        type:dto.type||PaymentTransactionType.MANUAL_PAYMENT,
        status:PaymentTransactionStatus.VERIFIED,
        amount,
        currency:'BDT',
        externalReference:dto.externalReference||null,
        idempotencyKey:dto.idempotencyKey||null,
        paymentMethod:dto.paymentMethod||'MANUAL',
        verifiedAt:new Date(),
        createdBy:actorId,
      } as any,{transaction:t});
      await this.recalculate(order.id,t);
    });

    return this.ledger(order.id,undefined,true);
  }

  async setTransactionStatus(id:string,dto:TransactionStatusDto){
    const tx=await this.txModel.findByPk(id);
    if(!tx)throw new NotFoundException('Payment transaction not found.');

    tx.status=dto.status;
    tx.failedReason=dto.failedReason||null;
    tx.verifiedAt=dto.status===PaymentTransactionStatus.VERIFIED?new Date():null;
    await tx.save();
    await this.recalculate(tx.orderId);
    return this.ledger(tx.orderId,undefined,true);
  }

  async createRefund(dto:CreateRefundDto,actorId:string){
    const order=await this.order(dto.orderId);
    const ledger=await this.ledger(order.id,undefined,true);
    if(dto.amount>ledger.summary.netPaid+0.005) throw new BadRequestException('Refund exceeds net paid amount.');
    return this.refundModel.create({
      orderId:order.id,
      paymentTransactionId:dto.paymentTransactionId||null,
      amount:dto.amount,
      reason:dto.reason,
      status:RefundStatus.REQUESTED,
      processedBy:actorId,
      metadata:{},
    } as any);
  }

  async updateRefund(id:string,dto:UpdateRefundDto,actorId:string){
    const row=await this.refundModel.findByPk(id);
    if(!row)throw new NotFoundException('Refund not found.');

    row.status=dto.status;
    row.providerReference=dto.providerReference||row.providerReference;
    if([RefundStatus.COMPLETED,RefundStatus.REJECTED,RefundStatus.FAILED].includes(dto.status)){
      row.processedAt=new Date();
      row.processedBy=actorId;
    }
    await row.save();
    await this.recalculate(row.orderId);
    return this.ledger(row.orderId,undefined,true);
  }

  allTransactions(){
    return this.txModel.findAll({order:[['createdAt','DESC']],limit:500});
  }

  allRefunds(){
    return this.refundModel.findAll({order:[['createdAt','DESC']],limit:500});
  }

  async userTransactions(userId:string){
    return this.txModel.findAll({where:{userId},order:[['createdAt','DESC']]});
  }

  async webhook(provider:string,eventKey:string,payload:any,signatureValid:boolean){
    if(!eventKey?.trim()) throw new BadRequestException('Event key is required.');
    const existing=await this.webhookModel.findOne({where:{eventKey}});
    if(existing) return {duplicate:true,processed:existing.processed};

    const row=await this.webhookModel.create({
      provider:provider.toUpperCase(),
      eventKey,
      signatureValid,
      payload:payload||{},
      processed:false,
    } as any);

    if(!signatureValid){
      return {accepted:true,processed:false,reason:'Signature is not verified.'};
    }

    const reference=String(payload?.reference||payload?.transactionId||payload?.tran_id||'');
    const status=String(payload?.status||'').toUpperCase();
    const tx=reference
      ?await this.txModel.findOne({
          where:{
            externalReference:reference,
          },
        })
      :null;

    if(tx){
      if(['SUCCESS','PAID','COMPLETED','VALID'].includes(status)){
        tx.status=PaymentTransactionStatus.VERIFIED;
        tx.verifiedAt=new Date();
      }else if(['FAILED','CANCELLED','INVALID'].includes(status)){
        tx.status=PaymentTransactionStatus.FAILED;
        tx.failedReason=`Provider webhook status: ${status}`;
      }
      tx.providerPayload=payload||{};
      await tx.save();
      await this.recalculate(tx.orderId);
    }

    row.processed=true;
    row.processedAt=new Date();
    await row.save();
    return {accepted:true,processed:true,matchedTransaction:Boolean(tx)};
  }

  signatureForDevelopment(provider:string,eventKey:string){
    return createHash('sha256').update(`${provider}:${eventKey}`).digest('hex');
  }
}
