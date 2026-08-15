import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Order, PaymentMode } from '../commerce/models/order.model';
import { CourierShipment, ShipmentStatus } from './models/courier-shipment.model';
import { ShipmentEvent } from './models/shipment-event.model';
import { CourierWebhookEvent } from './models/courier-webhook-event.model';
import {
  CodReconciliation, CodReconciliationStatus,
} from './models/cod-reconciliation.model';
import {
  CreateShipmentDto, ReconcileCodDto, ShipmentStatusDto,
} from './dto/courier.dto';
import { DeliveryMode, ShippingZone } from '../customer/models/shipping-zone.model';

@Injectable()
export class CourierService {
  constructor(
    @InjectModel(Order) private readonly orderModel:typeof Order,
    @InjectModel(CourierShipment) private readonly shipmentModel:typeof CourierShipment,
    @InjectModel(ShipmentEvent) private readonly eventModel:typeof ShipmentEvent,
    @InjectModel(CourierWebhookEvent) private readonly webhookModel:typeof CourierWebhookEvent,
    @InjectModel(CodReconciliation) private readonly codModel:typeof CodReconciliation,
    @InjectModel(ShippingZone) private readonly zoneModel:typeof ShippingZone,
  ) {}

  private async order(id:string){
    const row=await this.orderModel.findByPk(id);
    if(!row)throw new NotFoundException('Order not found.');
    return row;
  }

  private async zoneFor(order:Order){
    const district=order.district||order.city||'';
    const area=order.area||null;
    let zone=area?await this.zoneModel.findOne({
      where:{district,area,active:true},
    }):null;
    if(!zone)zone=await this.zoneModel.findOne({
      where:{district,area:null,active:true},
    });
    return zone;
  }

  async recommendation(orderId:string){
    const order=await this.order(orderId);
    const zone=await this.zoneFor(order);

    if(zone){
      if(zone.deliveryMode===DeliveryMode.INTERNAL ||
         (zone.deliveryMode===DeliveryMode.AUTO&&zone.internalServiceable)){
        return {
          provider:'INTERNAL',
          mode:zone.deliveryMode,
          reason:'Internal delivery is enabled for this shipping zone.',
          charge:Number(zone.charge),
          zoneId:zone.id,
        };
      }
      return {
        provider:(zone.preferredProvider||'EXTERNAL').toUpperCase(),
        mode:zone.deliveryMode,
        reason:zone.preferredProvider
          ?`Preferred courier for this zone is ${zone.preferredProvider}.`
          :'External courier is recommended for this zone.',
        charge:Number(zone.charge),
        zoneId:zone.id,
      };
    }

    if(String(order.district||order.city||'').toLowerCase()==='dhaka'){
      return {provider:'INTERNAL',mode:'FALLBACK',reason:'Dhaka fallback internal delivery.',charge:0,zoneId:null};
    }
    return {provider:'EXTERNAL',mode:'FALLBACK',reason:'Outside configured internal coverage.',charge:0,zoneId:null};
  }

  private normalized(input:string){
    const value=String(input||'').toUpperCase().replace(/[\s-]+/g,'_');
    const map:Record<string,ShipmentStatus>={
      CREATED:ShipmentStatus.CREATED,PENDING:ShipmentStatus.CREATED,
      PICKUP_REQUESTED:ShipmentStatus.PICKUP_REQUESTED,
      PICKED_UP:ShipmentStatus.PICKED_UP,PICKED:ShipmentStatus.PICKED_UP,
      IN_TRANSIT:ShipmentStatus.IN_TRANSIT,TRANSIT:ShipmentStatus.IN_TRANSIT,
      OUT_FOR_DELIVERY:ShipmentStatus.OUT_FOR_DELIVERY,
      DELIVERED:ShipmentStatus.DELIVERED,SUCCESS:ShipmentStatus.DELIVERED,
      FAILED:ShipmentStatus.FAILED,DELIVERY_FAILED:ShipmentStatus.FAILED,
      RETURNED:ShipmentStatus.RETURNED,RETURN_TO_ORIGIN:ShipmentStatus.RETURNED,
      CANCELLED:ShipmentStatus.CANCELLED,
    };
    return map[value]||ShipmentStatus.IN_TRANSIT;
  }

  async create(dto:CreateShipmentDto,actorId:string){
    const order=await this.order(dto.orderId);
    const active=await this.shipmentModel.findAll({where:{orderId:order.id}});
    const existing=active.find(x=>x.status!==ShipmentStatus.CANCELLED&&x.status!==ShipmentStatus.RETURNED);
    if(existing)throw new BadRequestException('An active shipment already exists for this order.');

    const rec=await this.recommendation(order.id);
    const requested=(dto.provider||'AUTO').toUpperCase();
    const provider=requested==='AUTO'?rec.provider:requested;
    const tracking=dto.trackingCode||order.trackingNumber||`NCS-${Date.now().toString(36).toUpperCase()}`;

    const shipment=await this.shipmentModel.create({
      orderId:order.id,provider,status:ShipmentStatus.CREATED,
      consignmentId:dto.consignmentId||null,trackingCode:tracking,
      trackingUrl:dto.trackingUrl||null,
      codAmount:order.paymentMode===PaymentMode.COD?Number(order.total):0,
      deliveryFee:dto.deliveryFee??rec.charge??0,
      recipientName:order.customerName,phone:order.phone,
      deliveryAddress:order.addressLine,
      district:order.district||order.city||null,area:order.area||null,
      providerPayload:{
        selection:requested==='AUTO'?'AUTO':'MANUAL',
        recommendation:rec,
        providerConfigured:provider==='INTERNAL',
        note:provider==='INTERNAL'
          ?'Internal rider shipment.'
          :'External courier record created. Live API requires provider credentials.',
      },
      createdBy:actorId,
    } as any);

    if(!order.trackingNumber){order.trackingNumber=tracking;await order.save()}

    await this.eventModel.create({
      shipmentId:shipment.id,providerStatus:'CREATED',
      normalizedStatus:ShipmentStatus.CREATED,
      note:`Shipment created using ${requested==='AUTO'?'automatic':'manual'} provider selection.`,
      rawPayload:{recommendation:rec},
    } as any);

    if(Number(shipment.codAmount)>0){
      await this.codModel.findOrCreate({
        where:{shipmentId:shipment.id},
        defaults:{
          shipmentId:shipment.id,orderId:order.id,
          expectedAmount:Number(shipment.codAmount),
          collectedAmount:0,settledAmount:0,
          status:CodReconciliationStatus.PENDING,createdBy:actorId,
        } as any,
      });
    }
    return this.details(shipment.id);
  }

  async updateStatus(id:string,dto:ShipmentStatusDto){
    const shipment=await this.shipmentModel.findByPk(id);
    if(!shipment)throw new NotFoundException('Shipment not found.');
    shipment.status=dto.status;
    if(dto.failureReason)shipment.failureReason=dto.failureReason;
    if(dto.status===ShipmentStatus.PICKED_UP&&!shipment.shippedAt)shipment.shippedAt=new Date();
    if(dto.status===ShipmentStatus.DELIVERED)shipment.deliveredAt=new Date();
    if(dto.status===ShipmentStatus.FAILED)shipment.failedAt=new Date();
    await shipment.save();
    await this.eventModel.create({
      shipmentId:shipment.id,providerStatus:dto.providerStatus||dto.status,
      normalizedStatus:dto.status,note:dto.note||dto.failureReason||null,
      rawPayload:{manual:true},
    } as any);
    return this.details(shipment.id);
  }

  async details(id:string){
    const shipment=await this.shipmentModel.findByPk(id);
    if(!shipment)throw new NotFoundException('Shipment not found.');
    const [events,reconciliation,order]=await Promise.all([
      this.eventModel.findAll({where:{shipmentId:id},order:[['eventTime','DESC']]}),
      this.codModel.findOne({where:{shipmentId:id}}),
      this.orderModel.findByPk(shipment.orderId),
    ]);
    return {shipment,events,reconciliation,order};
  }

  async byOrder(orderId:string,userId?:string,admin=false){
    const order=await this.order(orderId);
    if(!admin&&userId&&order.userId!==userId)throw new NotFoundException('Order not found.');
    const rows=await this.shipmentModel.findAll({where:{orderId},order:[['createdAt','DESC']]});
    return Promise.all(rows.map(x=>this.details(x.id)));
  }

  async all(){
    const rows=await this.shipmentModel.findAll({order:[['createdAt','DESC']],limit:500});
    return Promise.all(rows.map(x=>this.details(x.id)));
  }

  async reconcile(shipmentId:string,dto:ReconcileCodDto,actorId:string){
    const shipment=await this.shipmentModel.findByPk(shipmentId);
    if(!shipment)throw new NotFoundException('Shipment not found.');
    const [row]=await this.codModel.findOrCreate({
      where:{shipmentId},
      defaults:{
        shipmentId,orderId:shipment.orderId,
        expectedAmount:Number(shipment.codAmount),collectedAmount:0,settledAmount:0,
        status:CodReconciliationStatus.PENDING,createdBy:actorId,
      } as any,
    });
    row.collectedAmount=String(dto.collectedAmount);
    row.settledAmount=String(dto.settledAmount);
    row.status=dto.status;
    row.settlementReference=dto.settlementReference||null;
    row.note=dto.note||null;row.createdBy=actorId;
    row.settledAt=dto.status===CodReconciliationStatus.SETTLED?new Date():null;
    await row.save();
    return this.details(shipmentId);
  }

  async webhook(provider:string,eventKey:string,payload:any,signatureValid:boolean){
    if(!eventKey?.trim())throw new BadRequestException('Event key is required.');
    const previous=await this.webhookModel.findOne({where:{eventKey}});
    if(previous)return {duplicate:true,processed:previous.processed};
    const event=await this.webhookModel.create({
      provider:provider.toUpperCase(),eventKey,signatureValid,payload:payload||{},processed:false,
    } as any);
    if(!signatureValid)return {accepted:true,processed:false,reason:'Signature is not verified.'};

    const consignment=String(payload?.consignmentId||payload?.consignment_id||payload?.trackingCode||payload?.tracking_code||'');
    const shipment=consignment
      ?await this.shipmentModel.findOne({where:{provider:provider.toUpperCase(),consignmentId:consignment}})
        ||await this.shipmentModel.findOne({where:{trackingCode:consignment}})
      :null;

    if(shipment){
      const providerStatus=String(payload?.status||payload?.event||'IN_TRANSIT');
      const status=this.normalized(providerStatus);
      shipment.status=status;shipment.providerPayload=payload||{};
      if(status===ShipmentStatus.DELIVERED)shipment.deliveredAt=new Date();
      if(status===ShipmentStatus.FAILED){
        shipment.failedAt=new Date();
        shipment.failureReason=String(payload?.reason||payload?.message||'Courier reported failure');
      }
      await shipment.save();
      await this.eventModel.create({
        shipmentId:shipment.id,providerStatus,normalizedStatus:status,
        note:String(payload?.message||payload?.reason||'')||null,rawPayload:payload||{},
      } as any);
    }
    event.processed=true;event.processedAt=new Date();await event.save();
    return {accepted:true,processed:true,matchedShipment:Boolean(shipment)};
  }
}
