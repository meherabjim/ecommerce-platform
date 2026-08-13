import { Module } from '@nestjs/common';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/models/user.model';

import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { CommerceModule } from './commerce/commerce.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';

import { Category } from './catalog/models/category.model';
import { Brand } from './catalog/models/brand.model';
import { AttributeGroup } from './catalog/models/attribute-group.model';
import { AttributeValue } from './catalog/models/attribute-value.model';
import { Product } from './catalog/models/product.model';
import { ProductVariant } from './catalog/models/product-variant.model';

import { Warehouse } from './inventory/models/warehouse.model';
import { Inventory } from './inventory/models/inventory.model';
import { InventoryMovement } from './inventory/models/inventory-movement.model';

import { Cart } from './commerce/models/cart.model';
import { CartItem } from './commerce/models/cart-item.model';
import { Order } from './commerce/models/order.model';
import { OrderItem } from './commerce/models/order-item.model';
import { OrderStatusHistory } from './commerce/models/order-status-history.model';

import { Promotion } from './promotions/models/promotion.model';
import { Review } from './reviews/models/review.model';

@Module({
  imports:[
    ConfigModule.forRoot({isGlobal:true}),
    SequelizeModule.forRootAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(c:ConfigService)=>({
        dialect:'postgres',
        host:c.get<string>('DB_HOST','127.0.0.1'),
        port:Number(c.get<string>('DB_PORT','5432')),
        username:c.get<string>('DB_USERNAME','postgres'),
        password:c.get<string>('DB_PASSWORD'),
        database:c.get<string>('DB_DATABASE','neuro_commerce'),
        models:[
          User,Category,Brand,AttributeGroup,AttributeValue,Product,ProductVariant,
          Warehouse,Inventory,InventoryMovement,
          Cart,CartItem,Order,OrderItem,OrderStatusHistory,
          Promotion,Review
        ],
        autoLoadModels:true,
        synchronize:c.get<string>('DB_SYNC','true')==='true',
        logging:false
      })
    }),
    UsersModule,
    AuthModule,
    InventoryModule,
    CatalogModule,
    PromotionsModule,
    CommerceModule,
    ReviewsModule
  ]
})
export class AppModule {}
