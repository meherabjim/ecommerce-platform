import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Review, ReviewStatus } from './models/review.model';
import { CreateReviewDto } from './dto/review.dto';
import { Order, OrderStatus } from '../commerce/models/order.model';
import { OrderItem } from '../commerce/models/order-item.model';
import { ProductVariant } from '../catalog/models/product-variant.model';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private model: typeof Review,

    @InjectModel(Order)
    private orderModel: typeof Order,

    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,

    @InjectModel(ProductVariant)
    private variantModel: typeof ProductVariant,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // --------------------------------------------------------
    // Find the actual product from the purchased variant
    // --------------------------------------------------------
    const variant = await this.variantModel.findByPk(dto.variantId);

    if (!variant) {
      throw new NotFoundException('Product variant not found.');
    }

    const productId = variant.productId;

    // --------------------------------------------------------
    // One review per customer per product
    // --------------------------------------------------------
    const existing = await this.model.findOne({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'You already reviewed this product.',
      );
    }

    // --------------------------------------------------------
    // Get only this customer's DELIVERED orders
    // --------------------------------------------------------
    const deliveredOrders = await this.orderModel.findAll({
      where: {
        userId,
        status: OrderStatus.DELIVERED,
      },
      attributes: ['id'],
    });

    const deliveredOrderIds = deliveredOrders.map(
      (order) => order.id,
    );

    if (!deliveredOrderIds.length) {
      throw new BadRequestException(
        'Only customers with a delivered order can review this product.',
      );
    }

    // --------------------------------------------------------
    // Confirm that THIS exact variant was purchased
    // in one of those delivered orders
    // --------------------------------------------------------
    const purchasedItem = await this.orderItemModel.findOne({
      where: {
        orderId: {
          [Op.in]: deliveredOrderIds,
        },
        variantId: dto.variantId,
      },
    });

    if (!purchasedItem) {
      throw new BadRequestException(
        'Only customers with a delivered order can review this product.',
      );
    }

    // --------------------------------------------------------
    // Review waits for admin moderation
    // --------------------------------------------------------
    return this.model.create({
      userId,
      productId,
      rating: dto.rating,
      comment: dto.comment || null,
      status: ReviewStatus.PENDING,
    } as any);
  }

  // ----------------------------------------------------------
  // Reviews already submitted by the logged-in customer.
  //
  // variantIds allows Order Details to identify already-reviewed
  // products without changing the order table/model.
  // ----------------------------------------------------------
  async mine(userId: string) {
    const reviews = await this.model.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const result: any[] = [];

    for (const review of reviews) {
      const variants = await this.variantModel.findAll({
        where: {
          productId: review.productId,
        },
        attributes: ['id'],
      });

      result.push({
        id: review.id,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt,
        variantIds: variants.map((variant) => variant.id),
      });
    }

    return result;
  }

  // ----------------------------------------------------------
  // Public product page: APPROVED reviews only
  // ----------------------------------------------------------
  async publicForProduct(productId: string) {
    const rows = await this.model.findAll({
      where: {
        productId,
        status: ReviewStatus.APPROVED,
      },
      order: [['createdAt', 'DESC']],
    });

    const avg = rows.length
      ? rows.reduce((sum, row) => sum + row.rating, 0) / rows.length
      : 0;

    return {
      average: Number(avg.toFixed(1)),
      count: rows.length,
      reviews: rows,
    };
  }

  // ----------------------------------------------------------
  // Admin moderation list
  // ----------------------------------------------------------
  list() {
    return this.model.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  // ----------------------------------------------------------
  // Admin approve/reject
  // ----------------------------------------------------------
  async moderate(id: string, status: ReviewStatus) {
    const review = await this.model.findByPk(id);

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    review.status = status;
    await review.save();

    return review;
  }
}

