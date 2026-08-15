import { User } from '../users/models/user.model';
import { UserRole } from '../common/enums/user-role.enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import {
  InjectModel,
} from '@nestjs/sequelize';

import {
  Wishlist,
} from './models/wishlist.model';

import {
  Notification,
  NotificationType,
} from './models/notification.model';

import {
  ReturnRequest,
  ReturnStatus,
} from './models/return-request.model';

import {
  ShippingZone,
} from './models/shipping-zone.model';

import {
  Product,
} from '../catalog/models/product.model';

import {
  ProductVariant,
} from '../catalog/models/product-variant.model';

import {
  Order,
  OrderStatus,
  PaymentStatus,
} from '../commerce/models/order.model';


@Injectable()
export class CustomerService implements OnModuleInit {

  constructor(
    @InjectModel(Wishlist)
    private wishlistModel:typeof Wishlist,

    @InjectModel(Notification)
    private notificationModel:typeof Notification,
    @InjectModel(User) private userModel:typeof User,

    @InjectModel(ReturnRequest)
    private returnModel:typeof ReturnRequest,

    @InjectModel(ShippingZone)
    private shippingModel:typeof ShippingZone,

    @InjectModel(Product)
    private productModel:typeof Product,

    @InjectModel(ProductVariant)
    private variantModel:typeof ProductVariant,

    @InjectModel(Order)
    private orderModel:typeof Order,
  ){}


  async onModuleInit() {

    const count =
      await this.shippingModel.count();

    if (count > 0) return;

    await this.shippingModel.bulkCreate([
      {
        district:'Dhaka',
        area:null,
        charge:80,
        freeShippingThreshold:3000,
        active:true,
      },
      {
        district:'Dhaka',
        area:'Bhatara',
        charge:70,
        freeShippingThreshold:3000,
        active:true,
      },
      {
        district:'Dhaka',
        area:'Bashundhara R/A',
        charge:70,
        freeShippingThreshold:3000,
        active:true,
      },
      {
        district:'Dhaka',
        area:'Gulshan 1',
        charge:80,
        freeShippingThreshold:3000,
        active:true,
      },
      {
        district:'Dhaka',
        area:'Gulshan 2',
        charge:80,
        freeShippingThreshold:3000,
        active:true,
      },
      {
        district:'Gazipur',
        area:null,
        charge:120,
        freeShippingThreshold:3500,
        active:true,
      },
      {
        district:'Narayanganj',
        area:null,
        charge:120,
        freeShippingThreshold:3500,
        active:true,
      },
      {
        district:'Chattogram',
        area:null,
        charge:140,
        freeShippingThreshold:4000,
        active:true,
      },
    ] as any);
  }


  // ========================================================
  // SHIPPING QUOTE
  // ========================================================

  async shippingQuote(
    district:string,
    area:string|undefined,
    subtotal:number,
  ) {

    if (!district) {
      return {
        charge:
          subtotal >= 3000
            ? 0
            : 120,
        rule:'DEFAULT',
      };
    }

    let zone =
      area
        ? await this.shippingModel.findOne({
            where:{
              district,
              area,
              active:true,
            },
          })
        : null;

    if (!zone) {
      zone =
        await this.shippingModel.findOne({
          where:{
            district,
            area:null,
            active:true,
          },
        });
    }

    if (!zone) {
      return {
        charge:
          subtotal >= 4000
            ? 0
            : 150,

        freeShippingThreshold:4000,
        rule:'OUTSIDE_DEFAULT',
      };
    }

    const threshold =
      Number(
        zone.freeShippingThreshold,
      );

    return {
      charge:
        subtotal >= threshold
          ? 0
          : Number(zone.charge),

      freeShippingThreshold:
        threshold,

      district:
        zone.district,

      area:
        zone.area,

      rule:'ZONE',
      deliveryMode:zone.deliveryMode||'AUTO',
      internalServiceable:Boolean(zone.internalServiceable),
      preferredProvider:zone.preferredProvider||null,
      suggestedProvider:(zone.deliveryMode==='INTERNAL'||(zone.deliveryMode==='AUTO'&&zone.internalServiceable))?'INTERNAL':(zone.preferredProvider||'EXTERNAL'),
    };
  }


  // ========================================================
  // ADMIN SHIPPING ZONES
  // ========================================================

  listShippingZones() {
    return this.shippingModel.findAll({
      order:[
        ['district','ASC'],
        ['area','ASC'],
      ],
    });
  }


  async createShippingZone(input:{
    district:string;
    area?:string;
    charge:number;
    freeShippingThreshold:number;
    active?:boolean;
  }) {

    const district =
      input.district.trim();

    const area =
      input.area?.trim() || null;

    const existing =
      await this.shippingModel.findOne({
        where:{
          district,
          area,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'A shipping rule already exists for this district/area.',
      );
    }

    return this.shippingModel.create({
      district,
      area,
      charge:String(input.charge),
      freeShippingThreshold:
        String(
          input.freeShippingThreshold,
        ),
      active:
        input.active !== false,
    } as any);
  }


  async updateShippingZone(
    id:string,
    input:{
      district:string;
      area?:string;
      charge:number;
      freeShippingThreshold:number;
      active?:boolean;
    },
  ) {

    const zone =
      await this.shippingModel.findByPk(
        id,
      );

    if (!zone) {
      throw new NotFoundException(
        'Shipping zone not found.',
      );
    }

    zone.district =
      input.district.trim();

    zone.area =
      input.area?.trim() || null;

    zone.charge =
      String(input.charge);

    zone.freeShippingThreshold =
      String(
        input.freeShippingThreshold,
      );

    zone.active =
      input.active !== false;

    await zone.save();

    return zone;
  }


  async deleteShippingZone(
    id:string,
  ) {

    const zone =
      await this.shippingModel.findByPk(
        id,
      );

    if (!zone) {
      throw new NotFoundException(
        'Shipping zone not found.',
      );
    }

    await zone.destroy();

    return {
      deleted:true,
    };
  }


  // ========================================================
  // WISHLIST
  // ========================================================

  async wishlist(userId:string) {

    const rows =
      await this.wishlistModel.findAll({
        where:{userId},
        order:[['createdAt','DESC']],
      });

    if (!rows.length) {
      return [];
    }

    const products =
      await this.productModel.findAll({
        where:{
          id:
            rows.map(
              row =>
                row.productId,
            ),
        } as any,
      });

    const variants =
      await this.variantModel.findAll();

    return rows.map(row => {

      const product =
        products.find(
          x =>
            x.id ===
            row.productId,
        );

      const productVariants =
        variants.filter(
          x =>
            x.productId ===
            row.productId,
        );

      return {
        ...row.toJSON(),

        product:
          product
            ? {
                ...product.toJSON(),
                variants:
                  productVariants,
              }
            : null,
      };
    });
  }


  async addWishlist(
    userId:string,
    productId:string,
  ) {

    const product =
      await this.productModel.findByPk(
        productId,
      );

    if (!product) {
      throw new NotFoundException(
        'Product not found.',
      );
    }

    const [row] =
      await this.wishlistModel.findOrCreate({
        where:{
          userId,
          productId,
        },

        defaults:{
          userId,
          productId,
        } as any,
      });

    return row;
  }


  async removeWishlist(
    userId:string,
    productId:string,
  ) {

    await this.wishlistModel.destroy({
      where:{
        userId,
        productId,
      },
    });

    return {
      removed:true,
    };
  }


  // ========================================================
  // NOTIFICATIONS
  // ========================================================

  notifications(userId:string) {

    return this.notificationModel.findAll({
      where:{userId},
      order:[['createdAt','DESC']],
      limit:100,
    });
  }


  async createNotification(
    userId:string,
    type:NotificationType,
    title:string,
    message:string,
    referenceId?:string,
  ) {

    return this.notificationModel.create({
      userId,
      type,
      title,
      message,
      referenceId:
        referenceId || null,
      isRead:false,
    } as any);
  }



  async ensurePromotionNotification(
    userId:string,
    input:{promotionId:string;code:string;name?:string;type?:string;value?:number|string;minOrder?:number|string},
  ) {
    if(!input?.promotionId || !input?.code) {
      throw new BadRequestException('Promotion id and code are required.');
    }

    const existing=await this.notificationModel.findOne({
      where:{
        userId,
        type:NotificationType.SYSTEM,
        referenceId:input.promotionId,
      },
    });

    if(existing) return {created:false,notification:existing};

    const value=Number(input.value||0);
    const discount=String(input.type||'').toUpperCase()==='PERCENT'
      ? `${value}% off`
      : `BDT ${value} off`;
    const minimum=Number(input.minOrder||0)>0
      ? ` Minimum order BDT ${Number(input.minOrder)}.`
      : '';

    const notification=await this.createNotification(
      userId,
      NotificationType.SYSTEM,
      `Coupon ${String(input.code).toUpperCase()} is live`,
      `${input.name||'A new promotion'}: ${discount}.${minimum} Use code ${String(input.code).toUpperCase()} at checkout.`,
      input.promotionId,
    );

    return {created:true,notification};
  }


  async markNotificationRead(
    userId:string,
    id:string,
  ) {

    const row =
      await this.notificationModel.findOne({
        where:{
          id,
          userId,
        },
      });

    if (!row) {
      throw new NotFoundException(
        'Notification not found.',
      );
    }

    row.isRead = true;

    await row.save();

    return row;
  }


  // ========================================================
  // RETURNS
  // ========================================================

  async myReturns(userId:string) {

    return this.returnModel.findAll({
      where:{userId},
      order:[['createdAt','DESC']],
    });
  }


  async requestReturn(
    userId:string,
    orderId:string,
    reason:string,
  ) {

    const order =
      await this.orderModel.findOne({
        where:{
          id:orderId,
          userId,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    if (
      order.status !==
      OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Only delivered orders can be returned.',
      );
    }

    const existing =
      await this.returnModel.findOne({
        where:{
          orderId,
          userId,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Return request already exists.',
      );
    }

    const row =
      await this.returnModel.create({
        userId,
        orderId,
        reason,
        status:
          ReturnStatus.REQUESTED,
        adminNote:null,
      } as any);

    await this.createNotification(
      userId,
      NotificationType.RETURN,
      'Return request received',
      `Return request for ${order.orderNumber} was submitted.`,
      order.id,
    );

    return row;
  }


  async allReturns() {

    const rows =
      await this.returnModel.findAll({
        order:[['createdAt','DESC']],
      });

    if (!rows.length) {
      return [];
    }

    const orders =
      await this.orderModel.findAll({
        where:{
          id:
            rows.map(
              row =>
                row.orderId,
            ),
        } as any,
      });

    return rows.map(row => ({
      ...row.toJSON(),

      order:
        orders.find(
          x =>
            x.id ===
            row.orderId,
        )?.toJSON() ||
        null,
    }));
  }


  async moderateReturn(
    id:string,
    status:ReturnStatus,
    adminNote?:string,
  ) {

    const row =
      await this.returnModel.findByPk(
        id,
      );

    if (!row) {
      throw new NotFoundException(
        'Return request not found.',
      );
    }

    row.status = status;

    row.adminNote =
      adminNote || null;

    await row.save();

    const order =
      await this.orderModel.findByPk(
        row.orderId,
      );

    if (
      order &&
      status ===
        ReturnStatus.REFUNDED
    ) {

      order.paymentStatus =
        PaymentStatus.REFUNDED;

      await order.save();
    }

    await this.createNotification(
      row.userId,
      NotificationType.RETURN,
      `Return ${status.toLowerCase()}`,
      adminNote ||
        `Your return request is now ${status.toLowerCase()}.`,
      row.orderId,
    );

    return row;
  }

  async adminNotifications(limit=100) {
    return this.notificationModel.findAll({
      order:[['createdAt','DESC']],
      limit:Math.min(Math.max(Number(limit)||100,1),500),
    });
  }

  async broadcastNotification(type:NotificationType,title:string,message:string) {
    const users=await this.userModel.findAll({where:{role:UserRole.CUSTOMER,status:'ACTIVE'} as any});
    if(!users.length) return {created:0};
    await this.notificationModel.bulkCreate(users.map((u:any)=>({
      userId:u.id,type,title:title.trim(),message:message.trim(),referenceId:null,isRead:false,
    })) as any);
    return {created:users.length};
  }

  async markAllNotificationsRead(userId:string) {
    const [updated]=await this.notificationModel.update({isRead:true} as any,{where:{userId,isRead:false}});
    return {updated};
  }

}
