import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Promotion } from './models/promotion.model';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';

@Module({
  imports:[SequelizeModule.forFeature([Promotion])],
  providers:[PromotionsService],
  controllers:[PromotionsController],
  exports:[PromotionsService]
})
export class PromotionsModule {}
