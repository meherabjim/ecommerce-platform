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
    private sequelize:Sequelize
  ){}

  private async cartFor(userId:string){const [c]=await this.cartModel.findOrCreate({where:{userId},defaults:{userId} as any});return c}
  async getCart(userId:string){
    const cart=await this.cartFor(userId),items=await this.cartItemModel.findAll({where:{cartId:cart.id}});
    const variants=await this.variantModel.findAll({where:{id:items.map(x=>x.variantId)} as any});const products=await this.productModel.findAll();const stock=await this.inventory.stockSummary();
    const detailed=items.map(i=>{const v=variants.find(x=>x.id===i.variantId);if(!v)return null;const p=products.find(x=>x.id===v.productId);const unit=Number(v.salePrice||v.price);return {id:i.id,variantId:i.variantId,quantity:i.quantity,productName:p?.name||'Product',slug:p?.slug||'',sku:v.sku,barcode:v.barcode,attributes:v.attributes,unitPrice:unit,lineTotal:unit*i.quantity,available:stock.find(s=>s.variantId===v.id)?.available??0}}).filter(Boolean);
    return {id:cart.id,items:detailed,subtotal:detailed.reduce((s:any,x:any)=>s+x.lineTotal,0),itemCount:detailed.reduce((s:any,x:any)=>s+x.quantity,0)};
  }
  async add(userId:string,dto:AddCartItemDto){const v=await this.variantModel.findByPk(dto.variantId);if(!v||!v.active)throw new NotFoundException('Variant not found.');const stock=(await this.inventory.stockSummary()).find(x=>x.variantId===v.id);if(!stock||dto.quantity>stock.available)throw new BadRequestException('Not enough stock.');const cart=await this.cartFor(userId);const existing=await this.cartItemModel.findOne({where:{cartId:cart.id,variantId:v.id}});if(existing){const next=existing.quantity+dto.quantity;if(next>stock.available)throw new BadRequestException('Not enough stock.');existing.quantity=next;await existing.save()}else await this.cartItemModel.create({cartId:cart.id,variantId:v.id,quantity:dto.quantity} as any);return this.getCart(userId)}
  async update(userId:string,itemId:string,dto:UpdateCartItemDto){const cart=await this.cartFor(userId);const item=await this.cartItemModel.findOne({where:{id:itemId,cartId:cart.id}});if(!item)throw new NotFoundException('Cart item not found.');const stock=(await this.inventory.stockSummary()).find(x=>x.variantId===item.variantId);if(!stock||dto.quantity>stock.available)throw new BadRequestException('Not enough stock.');item.quantity=dto.quantity;await item.save();return this.getCart(userId)}
  async remove(userId:string,itemId:string){const cart=await this.cartFor(userId);await this.cartItemModel.destroy({where:{id:itemId,cartId:cart.id}});return this.getCart(userId)}
  private orderNumber(){return `NC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`}
  private trackingNumber(){return `NCT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}

  async checkout(userId:string,dto:CheckoutDto){
    const cart=await this.getCart(userId);if(!cart.items.length)throw new BadRequestException('Cart is empty.');
    let delivery:any=dto;
    if(dto.addressId){const a=await this.users.addressById(userId,dto.addressId);delivery={...dto,customerName:a.recipientName,phone:a.phone,addressLine:a.addressLine,city:a.district,division:a.division,district:a.district,area:a.area,landmark:a.landmark,postalCode:a.postalCode,addressLabel:a.type}}
    const promo=await this.promotions.calculate(dto.couponCode,cart.subtotal);const shipping=cart.subtotal>=3000?0:120;const total=Math.max(0,cart.subtotal+shipping-promo.discount);
    return this.sequelize.transaction(async t=>{
      for(const i of cart.items as any[]) await this.inventory.reserve(i.variantId,i.quantity,t);
      const order=await this.orderModel.create({orderNumber:this.orderNumber(),userId,status:OrderStatus.CONFIRMED,paymentMode:dto.paymentMode,paymentStatus:dto.paymentMode===PaymentMode.COD?PaymentStatus.UNPAID:PaymentStatus.PENDING,subtotal:cart.subtotal,shippingCharge:shipping,discount:promo.discount,total,customerName:delivery.customerName,phone:delivery.phone,email:dto.email||null,addressLine:delivery.addressLine,city:delivery.city,division:delivery.division||null,district:delivery.district||delivery.city,area:delivery.area||null,landmark:delivery.landmark||null,postalCode:delivery.postalCode||null,addressLabel:delivery.addressLabel||null,notes:dto.notes||null} as any,{transaction:t});
      for(const i of cart.items as any[]) await this.orderItemModel.create({orderId:order.id,variantId:i.variantId,productName:i.productName,sku:i.sku,barcode:i.barcode,attributes:i.attributes,unitPrice:i.unitPrice,quantity:i.quantity,lineTotal:i.lineTotal} as any,{transaction:t});
      if(promo.promotion)await this.promotions.markUsed(promo.promotion.id,t);
      await this.historyModel.create({orderId:order.id,previousStatus:null,newStatus:OrderStatus.CONFIRMED,actorId:userId,note:promo.promotion?`Order placed with coupon ${promo.promotion.code}`:'Order placed by customer'} as any,{transaction:t});
      const c=await this.cartFor(userId);await this.cartItemModel.destroy({where:{cartId:c.id},transaction:t});return this.orderDetails(order.id,userId,false,t)
    })
  }

  async ordersForUser(userId:string){const orders=await this.orderModel.findAll({where:{userId},order:[['createdAt','DESC']]});return Promise.all(orders.map(o=>this.orderDetails(o.id,userId,false)))}
  async allOrders(){const orders=await this.orderModel.findAll({order:[['createdAt','DESC']]});return Promise.all(orders.map(o=>this.orderDetails(o.id,undefined,true)))}
  async orderDetails(id:string,userId?:string,admin=false,transaction?:any){
    const order=await this.orderModel.findByPk(id,{transaction});if(!order||(userId&&!admin&&order.userId!==userId))throw new NotFoundException('Order not found.');
    const rows=await this.orderItemModel.findAll({where:{orderId:id},transaction});const variantIds=rows.map(x=>x.variantId);const variants=variantIds.length?await this.variantModel.findAll({where:{id:variantIds} as any,transaction}):[];const items=rows.map(item=>({...item.toJSON(),productId:variants.find(v=>v.id===item.variantId)?.productId??null}));const history=await this.historyModel.findAll({where:{orderId:id},order:[['createdAt','ASC']],transaction});
    let deliveryAgent: any = null;if(order.deliveryAgentId){const u=await this.users.findById(order.deliveryAgentId);deliveryAgent=u?u.toSafeJSON():null}
    return {...order.toJSON(),items,history,deliveryAgent}
  }

  async assignDeliveryAgent(orderId:string,agentId:string,actorId:string){
    const agent=await this.users.findByIdOrFail(agentId);if(agent.role!==UserRole.DELIVERY_AGENT)throw new BadRequestException('Selected user is not a delivery agent.');
    const order=await this.orderModel.findByPk(orderId);if(!order)throw new NotFoundException('Order not found.');if([OrderStatus.DELIVERED,OrderStatus.CANCELLED].includes(order.status))throw new BadRequestException('Final-state order cannot be assigned.');
    order.deliveryAgentId=agent.id;if(!order.trackingNumber)order.trackingNumber=this.trackingNumber();await order.save();await this.historyModel.create({orderId:order.id,previousStatus:order.status,newStatus:order.status,actorId,note:`Delivery assigned to ${agent.name}`} as any);return this.orderDetails(order.id,undefined,true)
  }

  async deliveryOrders(agentId:string){const rows=await this.orderModel.findAll({where:{deliveryAgentId:agentId},order:[['createdAt','DESC']]});return Promise.all(rows.map(o=>this.orderDetails(o.id,undefined,true)))}

  async updateDeliveryStatus(orderId:string,agentId:string,status:OrderStatus,note?:string,failureReason?:string,codCollected?:number){
    const order=await this.orderModel.findOne({where:{id:orderId,deliveryAgentId:agentId}});if(!order)throw new NotFoundException('Assigned order not found.');
    const riderAllowed=[OrderStatus.READY_FOR_PICKUP,OrderStatus.SHIPPED,OrderStatus.IN_TRANSIT,OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERED,OrderStatus.DELIVERY_FAILED];if(!riderAllowed.includes(status))throw new BadRequestException('Delivery agent cannot use this status.');
    if(status===OrderStatus.DELIVERY_FAILED&&!failureReason)throw new BadRequestException('Failure reason is required.');
    if(failureReason)order.deliveryFailureReason=failureReason;if(codCollected!==undefined)order.codCollected=String(codCollected);await order.save();return this.updateStatus(orderId,status,agentId,note||failureReason)
  }

  async updateStatus(orderId:string,status:OrderStatus,actorId:string,note?:string){
    return this.sequelize.transaction(async t=>{
      const order=await this.orderModel.findByPk(orderId,{transaction:t,lock:t.LOCK.UPDATE});if(!order)throw new NotFoundException('Order not found.');const previous=order.status;if(previous===status)return this.orderDetails(orderId,undefined,true,t);
      const allowed:Record<string,OrderStatus[]>={
        [OrderStatus.PENDING]:[OrderStatus.CONFIRMED,OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]:[OrderStatus.PROCESSING,OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]:[OrderStatus.PACKED,OrderStatus.CANCELLED],
        [OrderStatus.PACKED]:[OrderStatus.READY_FOR_PICKUP,OrderStatus.SHIPPED,OrderStatus.CANCELLED],
        [OrderStatus.READY_FOR_PICKUP]:[OrderStatus.SHIPPED,OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]:[OrderStatus.IN_TRANSIT,OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERED,OrderStatus.CANCELLED],
        [OrderStatus.IN_TRANSIT]:[OrderStatus.OUT_FOR_DELIVERY,OrderStatus.DELIVERY_FAILED,OrderStatus.DELIVERED],
        [OrderStatus.OUT_FOR_DELIVERY]:[OrderStatus.DELIVERED,OrderStatus.DELIVERY_FAILED],
        [OrderStatus.DELIVERY_FAILED]:[OrderStatus.OUT_FOR_DELIVERY,OrderStatus.CANCELLED],
        [OrderStatus.DELIVERED]:[],[OrderStatus.CANCELLED]:[]};
      if(!allowed[previous]?.includes(status))throw new BadRequestException(`Cannot change order from ${previous} to ${status}.`);
      const items=await this.orderItemModel.findAll({where:{orderId},transaction:t});
      if(status===OrderStatus.CANCELLED)for(const i of items)await this.inventory.release(i.variantId,i.quantity,t);
      if(status===OrderStatus.DELIVERED){for(const i of items)await this.inventory.consumeReserved(i.variantId,i.quantity,t);if(order.paymentMode===PaymentMode.COD)order.paymentStatus=PaymentStatus.PAID}
      order.status=status;await order.save({transaction:t});await this.historyModel.create({orderId,previousStatus:previous,newStatus:status,actorId,note:note||null} as any,{transaction:t});return this.orderDetails(orderId,undefined,true,t)
    })
  }
}

