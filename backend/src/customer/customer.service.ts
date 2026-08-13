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

    const products =
      await this.productModel.findAll({
        where:{
          id:
            rows.map(
              x => x.productId,
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

    const orders =
      await this.orderModel.findAll({
        where:{
          id:
            rows.map(
              x => x.orderId,
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
}
