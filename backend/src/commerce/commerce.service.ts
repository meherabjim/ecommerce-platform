import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Cart } from './models/cart.model';
import { CartItem } from './models/cart-item.model';
import { Order, OrderStatus, PaymentMode, PaymentStatus } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { OrderStatusHistory } from './models/order-status-history.model';
import { ProductVariant } from '../catalog/models/product-variant.model';
import { Product } from '../catalog/models/product.model';
import { InventoryService } from '../inventory/inventory.service';
import { PromotionsService } from '../promotions/promotions.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CustomerService } from '../customer/customer.service';
import { NotificationType } from '../customer/models/notification.model';
import { PaymentsService } from '../payments/payments.service';

type StatusMeta = {
  cancellationReason?: string;
  codCollected?: number;
  failureReason?: string;
};

@Injectable()
export class CommerceService {
  constructor(
    @InjectModel(Cart) private cartModel:typeof Cart,
    @InjectModel(CartItem) private cartItemModel:typeof CartItem,
    @InjectModel(Order) private orderModel:typeof Order,
    @InjectModel(OrderItem) private orderItemModel:typeof OrderItem,
    @InjectModel(OrderStatusHistory) private historyModel:typeof OrderStatusHistory,
    @InjectModel(ProductVariant) private variantModel:typeof ProductVariant,
    @InjectModel(Product) private productModel:typeof Product,
    private inventory:InventoryService,
    private promotions:PromotionsService,
    private users:UsersService,
    private customer:CustomerService,
    private payments:PaymentsService,
    private sequelize:Sequelize,
  ) {}

  private async safeNotify(
    userId:string,
    type:NotificationType,
    title:string,
    message:string,
    entityId?:string,
  ){
    try{
      await this.customer.createNotification(userId,type,title,message,entityId);
    }catch{
      // Notification delivery must never roll back a valid commerce mutation.
    }
  }

  private async cartFor(userId:string){
    const [cart]=await this.cartModel.findOrCreate({
      where:{userId},
      defaults:{userId} as any,
    });
    return cart;
  }

  async getCart(userId:string){
    const cart=await this.cartFor(userId);
    const items=await this.cartItemModel.findAll({where:{cartId:cart.id}});
    const variants=items.length
      ? await this.variantModel.findAll({where:{id:items.map(x=>x.variantId)} as any})
      : [];
    const productIds=[...new Set(variants.map(v=>v.productId))];
    const products=productIds.length
      ? await this.productModel.findAll({where:{id:productIds} as any})
      : [];
    const stock=await this.inventory.stockSummary();

    const detailed=items.map(item=>{
      const variant=variants.find(x=>x.id===item.variantId);
      if(!variant)return null;
      const product=products.find(x=>x.id===variant.productId);
      const unitPrice=Number(variant.salePrice||variant.price);
      const mediaImage=Array.isArray((product as any)?.media)
        ? (product as any).media.find((m:any)=>m?.type==='image')?.url
        : null;
      return {
        id:item.id,
        variantId:item.variantId,
        quantity:item.quantity,
        productName:product?.name||'Product',
        productNameBn:(product as any)?.nameBn||null,
        slug:product?.slug||'',
        sku:variant.sku,
        barcode:variant.barcode,
        attributes:variant.attributes,
        unitPrice,
        lineTotal:unitPrice*item.quantity,
        available:stock.find(s=>s.variantId===variant.id)?.available??0,
        imageUrl:variant.imageUrl||mediaImage||(product as any)?.primaryImageUrl||null,
      };
    }).filter(Boolean) as any[];

    return {
      id:cart.id,
      items:detailed,
      subtotal:detailed.reduce((sum,item)=>sum+item.lineTotal,0),
      itemCount:detailed.reduce((sum,item)=>sum+item.quantity,0),
    };
  }

  async add(userId:string,dto:AddCartItemDto){
    const variant=await this.variantModel.findByPk(dto.variantId);
    if(!variant||!variant.active)throw new NotFoundException('Variant not found.');

    const stock=(await this.inventory.stockSummary()).find(x=>x.variantId===variant.id);
    if(!stock||dto.quantity>stock.available)throw new BadRequestException('Not enough stock.');

    const cart=await this.cartFor(userId);
    const existing=await this.cartItemModel.findOne({
      where:{cartId:cart.id,variantId:variant.id},
    });

    if(existing){
      const next=existing.quantity+dto.quantity;
      if(next>stock.available)throw new BadRequestException('Not enough stock.');
      existing.quantity=next;
      await existing.save();
    }else{
      await this.cartItemModel.create({
        cartId:cart.id,
        variantId:variant.id,
        quantity:dto.quantity,
      } as any);
    }
    return this.getCart(userId);
  }

  async update(userId:string,itemId:string,dto:UpdateCartItemDto){
    const cart=await this.cartFor(userId);
    const item=await this.cartItemModel.findOne({
      where:{id:itemId,cartId:cart.id},
    });
    if(!item)throw new NotFoundException('Cart item not found.');

    const stock=(await this.inventory.stockSummary()).find(x=>x.variantId===item.variantId);
    if(!stock||dto.quantity>stock.available)throw new BadRequestException('Not enough stock.');

    item.quantity=dto.quantity;
    await item.save();
    return this.getCart(userId);
  }

  async remove(userId:string,itemId:string){
    const cart=await this.cartFor(userId);
    await this.cartItemModel.destroy({where:{id:itemId,cartId:cart.id}});
    return this.getCart(userId);
  }

  private orderNumber(){
    return `NC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  }

  private trackingNumber(){
    return `NCT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }

  async checkout(userId:string,dto:CheckoutDto){
    const cart=await this.getCart(userId);
    if(!cart.items.length)throw new BadRequestException('Cart is empty.');

    let delivery:any=dto;
    if(dto.addressId){
      const address=await this.users.addressById(userId,dto.addressId);
      delivery={
        ...dto,
        customerName:address.recipientName,
        phone:address.phone,
        addressLine:address.addressLine,
        city:address.district,
        division:address.division,
        district:address.district,
        area:address.area,
        landmark:address.landmark,
        postalCode:address.postalCode,
        addressLabel:address.type,
        latitude:address.latitude===null?undefined:Number(address.latitude),
        longitude:address.longitude===null?undefined:Number(address.longitude),
        locationSource:address.locationSource,
      };
    }

    const promo=await this.promotions.calculate(dto.couponCode,cart.subtotal,userId);
    const shippingQuote=await this.customer.shippingQuote(
      delivery.district||delivery.city,
      delivery.area,
      cart.subtotal,
    );
    const shipping=Number(shippingQuote.charge||0);
    const total=Math.max(0,cart.subtotal+shipping-promo.discount);

    const orderId=await this.sequelize.transaction(async transaction=>{
      // Re-check and reserve inside the transaction. This is the checkout stock lock.
      for(const item of cart.items){
        await this.inventory.reserve(item.variantId,item.quantity,transaction);
      }

      const order=await this.orderModel.create({
        orderNumber:this.orderNumber(),
        userId,
        status:OrderStatus.CONFIRMED,
        paymentMode:dto.paymentMode,
        paymentStatus:dto.paymentMode===PaymentMode.COD
          ? PaymentStatus.UNPAID
          : PaymentStatus.PENDING,
        subtotal:cart.subtotal,
        shippingCharge:shipping,
        discount:promo.discount,
        total,
        customerName:delivery.customerName,
        phone:delivery.phone,
        email:dto.email||null,
        addressLine:delivery.addressLine,
        city:delivery.city,
        division:delivery.division||null,
        district:delivery.district||delivery.city,
        area:delivery.area||null,
        landmark:delivery.landmark||null,
        postalCode:delivery.postalCode||null,
        addressLabel:delivery.addressLabel||null,
        deliveryLatitude:delivery.latitude??null,
        deliveryLongitude:delivery.longitude??null,
        locationSource:delivery.locationSource||null,
        notes:dto.notes||null,
      } as any,{transaction});

      // Keep existing payments integration intact.
      await this.payments.createInitialForOrder(order,userId);

      for(const item of cart.items){
        await this.orderItemModel.create({
          orderId:order.id,
          variantId:item.variantId,
          productName:item.productName,
          sku:item.sku,
          barcode:item.barcode,
          attributes:item.attributes,
          unitPrice:item.unitPrice,
          quantity:item.quantity,
          lineTotal:item.lineTotal,
        } as any,{transaction});
      }

      if(promo.promotion){
        await this.promotions.markUsed(
          promo.promotion.id,userId,order.id,promo.discount,transaction,
        );
      }

      await this.historyModel.create({
        orderId:order.id,
        previousStatus:null,
        newStatus:OrderStatus.CONFIRMED,
        actorId:userId,
        note:promo.promotion
          ? `Order placed with coupon ${promo.promotion.code}`
          : 'Order placed by customer',
      } as any,{transaction});

      const customerCart=await this.cartFor(userId);
      await this.cartItemModel.destroy({
        where:{cartId:customerCart.id},
        transaction,
      });

      return order.id;
    });

    const details=await this.orderDetails(orderId,userId,false);
    await this.safeNotify(
      userId,
      NotificationType.ORDER,
      'Order confirmed',
      `Your order ${details.orderNumber} has been confirmed.`,
      orderId,
    );
    return details;
  }

  async ordersForUser(userId:string){
    const orders=await this.orderModel.findAll({
      where:{userId},
      order:[['createdAt','DESC']],
    });
    return Promise.all(orders.map(o=>this.orderDetails(o.id,userId,false)));
  }

  async allOrders(){
    const orders=await this.orderModel.findAll({order:[['createdAt','DESC']]});
    return Promise.all(orders.map(o=>this.orderDetails(o.id,undefined,true)));
  }

  async orderDetails(id:string,userId?:string,admin=false,transaction?:any){
    const order=await this.orderModel.findByPk(id,{transaction});
    if(!order||(userId&&!admin&&order.userId!==userId)){
      throw new NotFoundException('Order not found.');
    }

    const rows=await this.orderItemModel.findAll({where:{orderId:id},transaction});
    const variantIds=rows.map(x=>x.variantId);
    const variants=variantIds.length
      ? await this.variantModel.findAll({where:{id:variantIds} as any,transaction})
      : [];
    const productIds=[...new Set(variants.map(v=>v.productId))];
    const products=productIds.length
      ? await this.productModel.findAll({where:{id:productIds} as any,transaction})
      : [];

    const items=rows.map(item=>{
      const variant=variants.find(v=>v.id===item.variantId);
      const product=products.find(p=>p.id===variant?.productId);
      const mediaImage=Array.isArray((product as any)?.media)
        ? (product as any).media.find((m:any)=>m?.type==='image')?.url
        : null;
      return {
        ...item.toJSON(),
        productId:variant?.productId??null,
        slug:product?.slug||null,
        productNameBn:(product as any)?.nameBn||null,
        imageUrl:variant?.imageUrl||mediaImage||(product as any)?.primaryImageUrl||null,
      };
    });

    const history=await this.historyModel.findAll({
      where:{orderId:id},
      order:[['createdAt','ASC']],
      transaction,
    });

    let deliveryAgent:any=null;
    if(order.deliveryAgentId){
      const user=await this.users.findById(order.deliveryAgentId);
      deliveryAgent=user?user.toSafeJSON():null;
    }

    return {...order.toJSON(),items,history,deliveryAgent};
  }

  async publicTrackOrder(orderNumber:string,phone:string){
    const number=String(orderNumber||'').trim();
    const suppliedPhone=String(phone||'').replace(/\D/g,'');
    if(!number||suppliedPhone.length<7){
      throw new NotFoundException('Order not found. Check the order number and phone number.');
    }

    const order=await this.orderModel.findOne({where:{orderNumber:number}});
    if(!order)throw new NotFoundException('Order not found. Check the order number and phone number.');

    const storedPhone=String(order.phone||'').replace(/\D/g,'');
    const phoneMatches=
      storedPhone===suppliedPhone||
      storedPhone.endsWith(suppliedPhone)||
      suppliedPhone.endsWith(storedPhone);

    if(!phoneMatches){
      throw new NotFoundException('Order not found. Check the order number and phone number.');
    }

    const rows=await this.orderItemModel.findAll({where:{orderId:order.id}});
    const history=await this.historyModel.findAll({
      where:{orderId:order.id},
      order:[['createdAt','ASC']],
    });

    return {
      orderNumber:order.orderNumber,
      status:order.status,
      paymentStatus:order.paymentStatus,
      paymentMode:order.paymentMode,
      total:order.total,
      trackingNumber:order.trackingNumber,
      city:order.city,
      division:order.division,
      district:order.district,
      area:order.area,
      deliveryAttemptCount:order.deliveryAttemptCount||0,
      lastDeliveryNote:order.lastDeliveryNote||null,
      lastDeliveryActionAt:order.lastDeliveryActionAt||null,
      cancellationReason:order.status===OrderStatus.CANCELLED
        ? order.cancellationReason
        : null,
      cancelledAt:order.cancelledAt,
      deliveredAt:order.deliveredAt,
      createdAt:order.createdAt,
      updatedAt:order.updatedAt,
      items:rows.map(x=>({
        id:x.id,
        productName:x.productName,
        sku:x.sku,
        attributes:x.attributes,
        unitPrice:x.unitPrice,
        quantity:x.quantity,
        lineTotal:x.lineTotal,
      })),
      history:history.map(x=>({
        id:x.id,
        previousStatus:x.previousStatus,
        newStatus:x.newStatus,
        note:x.note,
        createdAt:x.createdAt,
      })),
    };
  }

  async assignDeliveryAgent(orderId:string,agentId:string,actorId:string){
    const agent=await this.users.findByIdOrFail(agentId);
    if(agent.role!==UserRole.DELIVERY_AGENT){
      throw new BadRequestException('Selected user is not a delivery agent.');
    }

    const order=await this.orderModel.findByPk(orderId);
    if(!order)throw new NotFoundException('Order not found.');
    if([OrderStatus.DELIVERED,OrderStatus.CANCELLED].includes(order.status)){
      throw new BadRequestException('Final-state order cannot be assigned.');
    }

    order.deliveryAgentId=agent.id;
    if(!order.trackingNumber)order.trackingNumber=this.trackingNumber();
    await order.save();

    await this.historyModel.create({
      orderId:order.id,
      previousStatus:order.status,
      newStatus:order.status,
      actorId,
      note:`Delivery assigned to ${agent.name}`,
    } as any);

    return this.orderDetails(order.id,undefined,true);
  }

  async deliveryOrders(agentId:string){
    const rows=await this.orderModel.findAll({
      where:{deliveryAgentId:agentId},
      order:[['createdAt','DESC']],
    });
    return Promise.all(rows.map(o=>this.orderDetails(o.id,undefined,true)));
  }

  async updateDeliveryStatus(
    orderId:string,
    agentId:string,
    status:OrderStatus,
    note?:string,
    failureReason?:string,
    codCollected?:number,
  ){
    const order=await this.orderModel.findOne({
      where:{id:orderId,deliveryAgentId:agentId},
    });
    if(!order)throw new NotFoundException('Assigned order not found.');

    const riderAllowed=[
      OrderStatus.READY_FOR_PICKUP,
      OrderStatus.SHIPPED,
      OrderStatus.IN_TRANSIT,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.DELIVERY_FAILED,
    ];
    if(!riderAllowed.includes(status)){
      throw new BadRequestException('Delivery agent cannot use this status.');
    }
    if(status===OrderStatus.DELIVERY_FAILED&&!failureReason){
      throw new BadRequestException('Failure reason is required.');
    }

    return this.updateStatus(
      orderId,
      status,
      agentId,
      note||failureReason,
      {failureReason,codCollected},
    );
  }

  async cancelByCustomer(orderId:string,userId:string,reason:string){
    const order=await this.orderModel.findOne({where:{id:orderId,userId}});
    if(!order)throw new NotFoundException('Order not found.');

    if(![OrderStatus.CONFIRMED,OrderStatus.PROCESSING].includes(order.status)){
      throw new BadRequestException('This order can no longer be cancelled by the customer.');
    }

    const result=await this.updateStatus(
      order.id,
      OrderStatus.CANCELLED,
      userId,
      `Cancelled by customer: ${reason}`,
      {cancellationReason:reason},
    );

    await this.safeNotify(
      userId,
      NotificationType.ORDER,
      'Order cancelled',
      `Order ${order.orderNumber} was cancelled.`,
      order.id,
    );
    return result;
  }

  async reorder(orderId:string,userId:string){
    const order=await this.orderModel.findOne({where:{id:orderId,userId}});
    if(!order)throw new NotFoundException('Order not found.');

    const items=await this.orderItemModel.findAll({where:{orderId}});
    const skipped:any[]=[];

    for(const item of items){
      try{
        await this.add(userId,{
          variantId:item.variantId,
          quantity:item.quantity,
        } as any);
      }catch(error:any){
        skipped.push({
          variantId:item.variantId,
          productName:item.productName,
          reason:error?.message||'Unavailable',
        });
      }
    }

    const cart=await this.getCart(userId);
    return {
      message:skipped.length
        ? 'Available items were added to your cart.'
        : 'All order items were added to your cart.',
      skipped,
      cart,
    };
  }

  async adminUpdatePaymentStatus(
    orderId:string,
    status:PaymentStatus,
    actorId:string,
    note?:string,
  ){
    const order=await this.orderModel.findByPk(orderId);
    if(!order)throw new NotFoundException('Order not found.');

    const previous=order.paymentStatus;
    if(previous===status){
      return this.orderDetails(order.id,undefined,true);
    }

    order.paymentStatus=status;
    await order.save();

    await this.historyModel.create({
      orderId:order.id,
      previousStatus:order.status,
      newStatus:order.status,
      actorId,
      note:note||`Payment status changed from ${previous} to ${status}`,
    } as any);

    await this.safeNotify(
      order.userId,
      NotificationType.PAYMENT,
      'Payment status updated',
      `Payment for ${order.orderNumber} is now ${status.replaceAll('_',' ')}.`,
      order.id,
    );

    return this.orderDetails(order.id,undefined,true);
  }

  async updateStatus(
    orderId:string,
    status:OrderStatus,
    actorId:string,
    note?:string,
    meta:StatusMeta={},
  ){
    const result=await this.sequelize.transaction(async transaction=>{
      const order=await this.orderModel.findByPk(orderId,{
        transaction,
        lock:transaction.LOCK.UPDATE,
      });
      if(!order)throw new NotFoundException('Order not found.');

      const previous=order.status;
      if(previous===status){
        return {details:await this.orderDetails(orderId,undefined,true,transaction),notify:false};
      }

      const allowed:Record<string,OrderStatus[]>={
        [OrderStatus.PENDING]:[OrderStatus.CONFIRMED,OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]:[OrderStatus.PROCESSING,OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]:[OrderStatus.PACKED,OrderStatus.CANCELLED],
        [OrderStatus.PACKED]:[OrderStatus.READY_FOR_PICKUP,OrderStatus.SHIPPED,OrderStatus.CANCELLED],
        [OrderStatus.READY_FOR_PICKUP]:[OrderStatus.SHIPPED,OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]:[OrderStatus.IN_TRANSIT,OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERY_FAILED],
        [OrderStatus.IN_TRANSIT]:[OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERY_FAILED,OrderStatus.DELIVERED],
        [OrderStatus.OUT_FOR_DELIVERY]:[OrderStatus.DELIVERED,OrderStatus.DELIVERY_FAILED],
        [OrderStatus.DELIVERY_FAILED]:[OrderStatus.OUT_FOR_DELIVERY,OrderStatus.CANCELLED],
        [OrderStatus.DELIVERED]:[],
        [OrderStatus.CANCELLED]:[],
      };

      if(!allowed[previous]?.includes(status)){
        throw new BadRequestException(`Cannot change order from ${previous} to ${status}.`);
      }

      // Online-payment orders must be verified before fulfillment begins.
      if(
        previous===OrderStatus.CONFIRMED &&
        status===OrderStatus.PROCESSING &&
        order.paymentMode===PaymentMode.FULL_ONLINE &&
        order.paymentStatus!==PaymentStatus.PAID
      ){
        throw new BadRequestException('Full online payment must be verified before processing this order.');
      }

      const items=await this.orderItemModel.findAll({
        where:{orderId},
        transaction,
      });

      if(status===OrderStatus.CANCELLED){
        for(const item of items){
          await this.inventory.release(item.variantId,item.quantity,transaction);
        }
        order.cancellationReason=meta.cancellationReason||note||'Cancelled by operations';
        order.cancelledBy=actorId;
        order.cancelledAt=new Date();
      }

      if([OrderStatus.READY_FOR_PICKUP,OrderStatus.SHIPPED].includes(status)&&!order.trackingNumber){
        order.trackingNumber=this.trackingNumber();
      }

      if([
        OrderStatus.READY_FOR_PICKUP,OrderStatus.SHIPPED,OrderStatus.IN_TRANSIT,
        OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERED,OrderStatus.DELIVERY_FAILED,
      ].includes(status)){
        order.lastDeliveryActionAt=new Date();
        if(note)order.lastDeliveryNote=note.slice(0,500);
      }
      if(status===OrderStatus.DELIVERY_FAILED&&meta.failureReason){
        order.deliveryFailureReason=meta.failureReason;
        order.deliveryAttemptCount=Number(order.deliveryAttemptCount||0)+1;
      }

      if(status===OrderStatus.DELIVERED){
        if(order.paymentMode===PaymentMode.FULL_ONLINE&&order.paymentStatus!==PaymentStatus.PAID){
          throw new BadRequestException('Online payment is not verified.');
        }

        if(order.paymentMode===PaymentMode.COD&&order.paymentStatus!==PaymentStatus.PAID){
          const collected=Number(meta.codCollected);
          const total=Number(order.total);
          if(!Number.isFinite(collected)||collected+0.001<total){
            throw new BadRequestException(`COD collection of at least BDT ${total.toFixed(2)} is required before delivery.`);
          }
          order.codCollected=String(collected);
          order.paymentStatus=PaymentStatus.PAID;
        }else if(meta.codCollected!==undefined){
          order.codCollected=String(meta.codCollected);
        }

        for(const item of items){
          await this.inventory.consumeReserved(item.variantId,item.quantity,transaction);
        }
        order.deliveredAt=new Date();
      }

      order.status=status;
      await order.save({transaction});

      await this.historyModel.create({
        orderId,
        previousStatus:previous,
        newStatus:status,
        actorId,
        note:note||null,
      } as any,{transaction});

      return {
        details:await this.orderDetails(orderId,undefined,true,transaction),
        notify:true,
      };
    });

    if(result.notify){
      await this.safeNotify(
        result.details.userId,
        NotificationType.DELIVERY,
        'Order status updated',
        `Order ${result.details.orderNumber} is now ${status.replaceAll('_',' ')}.`,
        result.details.id,
      );
    }
    return result.details;
  }
}
