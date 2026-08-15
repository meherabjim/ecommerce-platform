import { CourierShipment } from '../courier/models/courier-shipment.model';
import { Refund } from '../payments/models/refund.model';
import { PaymentTransaction } from '../payments/models/payment-transaction.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { OpsController } from './ops.controller';
import { OpsService } from './ops.service';
import { InvoiceService } from './invoice.service';
import { CustomerReportService } from './customer-report.service';

import { Order } from '../commerce/models/order.model';
import { OrderItem } from '../commerce/models/order-item.model';
import { User } from '../users/models/user.model';
import { Product } from '../catalog/models/product.model';
import { ProductVariant } from '../catalog/models/product-variant.model';
import { Inventory } from '../inventory/models/inventory.model';
import { ReturnRequest } from '../customer/models/return-request.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Order,
      OrderItem,
      User,
      Product,
      ProductVariant,
      Inventory,
      ReturnRequest,
      PaymentTransaction,
      Refund,
      CourierShipment,
    ]),
  ],
  controllers: [OpsController],
  providers: [OpsService, InvoiceService, CustomerReportService],
})
export class OpsModule {}

