import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cart } from './models/cart.model';
import { CartItem } from './models/cart-item.model';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { OrderStatusHistory } from './models/order-status-history.model';
import { ProductVariant } from '../catalog/models/product-variant.model';
import { Product } from '../catalog/models/product.model';
import { InventoryModule } from '../inventory/inventory.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { CommerceService } from './commerce.service';
import { CommerceController } from './commerce.controller';

@Module({
  imports:[
    SequelizeModule.forFeature([Cart,CartItem,Order,OrderItem,OrderStatusHistory,ProductVariant,Product]),
    InventoryModule,
    PromotionsModule
  ],
  providers:[CommerceService],
  controllers:[CommerceController]
})
export class CommerceModule {}
