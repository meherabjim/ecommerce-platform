import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './models/review.model';
import { Order } from '../commerce/models/order.model';
import { OrderItem } from '../commerce/models/order-item.model';
import { ProductVariant } from '../catalog/models/product-variant.model';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';

@Module({
  imports:[SequelizeModule.forFeature([Review,Order,OrderItem,ProductVariant])],
  providers:[ReviewsService],
  controllers:[ReviewsController]
})
export class ReviewsModule {}
