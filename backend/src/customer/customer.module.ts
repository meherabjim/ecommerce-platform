import {
  Module,
} from '@nestjs/common';

import {
  SequelizeModule,
} from '@nestjs/sequelize';

import {
  Wishlist,
} from './models/wishlist.model';

import {
  Notification,
} from './models/notification.model';

import {
  ReturnRequest,
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
} from '../commerce/models/order.model';

import {
  CustomerService,
} from './customer.service';

import {
  CustomerController,
} from './customer.controller';


@Module({
  imports:[
    SequelizeModule.forFeature([
      Wishlist,
      Notification,
      ReturnRequest,
      ShippingZone,
      Product,
      ProductVariant,
      Order,
    ]),
  ],

  providers:[
    CustomerService,
  ],

  controllers:[
    CustomerController,
  ],

  exports:[
    CustomerService,
  ],
})
export class CustomerModule {}
