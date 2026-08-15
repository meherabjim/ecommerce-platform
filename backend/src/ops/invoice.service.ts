import { Injectable,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../commerce/models/order.model';
import { OrderItem } from '../commerce/models/order-item.model';
import { PaymentTransaction } from '../payments/models/payment-transaction.model';
import { Refund } from '../payments/models/refund.model';
import { CourierShipment } from '../courier/models/courier-shipment.model';

@Injectable()
export class InvoiceService{
  constructor(
    @InjectModel(Order) private orders:typeof Order,
    @InjectModel(OrderItem) private items:typeof OrderItem,
    @InjectModel(PaymentTransaction) private tx:typeof PaymentTransaction,
    @InjectModel(Refund) private refunds:typeof Refund,
    @InjectModel(CourierShipment) private shipments:typeof CourierShipment,
  ){}

  async invoice(orderId:string,userId?:string,admin=false){
    const order=await this.orders.findByPk(orderId);
    if(!order||(!admin&&userId&&order.userId!==userId))throw new NotFoundException('Order not found.');
    const [items,transactions,refunds,shipment]=await Promise.all([
      this.items.findAll({where:{orderId}}),
      this.tx.findAll({where:{orderId},order:[['createdAt','ASC']]}),
      this.refunds.findAll({where:{orderId},order:[['createdAt','ASC']]}),
      this.shipments.findOne({where:{orderId},order:[['createdAt','DESC']]}),
    ]);
    const paid=transactions.filter((x:any)=>x.status==='VERIFIED'&&x.type!=='REFUND').reduce((s:number,x:any)=>s+Number(x.amount||0),0);
    const refunded=refunds.filter((x:any)=>x.status==='COMPLETED').reduce((s:number,x:any)=>s+Number(x.amount||0),0);
    return {
      invoiceNumber:`INV-${order.orderNumber}`,issuedAt:order.createdAt,
      order:{id:order.id,orderNumber:order.orderNumber,customerName:order.customerName,phone:order.phone,email:order.email,addressLine:order.addressLine,area:order.area,district:order.district||order.city,division:order.division,subtotal:Number(order.subtotal||0),shippingCharge:Number(order.shippingCharge||0),discount:Number(order.discount||0),total:Number(order.total||0),paymentMode:order.paymentMode,paymentStatus:order.paymentStatus,status:order.status,trackingNumber:order.trackingNumber},
      items:items.map((x:any)=>({id:x.id,productName:x.productName,quantity:Number(x.quantity||0),unitPrice:Number(x.unitPrice||0),lineTotal:Number(x.lineTotal||0)})),
      payment:{paid,refunded,netPaid:Math.max(0,paid-refunded),due:Math.max(0,Number(order.total||0)-(paid-refunded)),transactions,refunds},
      shipment,
    };
  }
}
