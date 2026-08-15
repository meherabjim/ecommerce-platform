import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion } from './models/promotion.model';
import { PromotionRedemption } from './models/promotion-redemption.model';
import { Order } from '../commerce/models/order.model';

@Module({
  imports:[SequelizeModule.forFeature([Promotion,PromotionRedemption,Order])],
  controllers:[PromotionsController],
  providers:[PromotionsService],
  exports:[PromotionsService],
})
export class PromotionsModule {}
