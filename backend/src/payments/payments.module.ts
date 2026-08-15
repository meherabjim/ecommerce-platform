import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentTransaction } from './models/payment-transaction.model';
import { Refund } from './models/refund.model';
import { PaymentWebhookEvent } from './models/payment-webhook-event.model';
import { Order } from '../commerce/models/order.model';

@Module({
  imports:[SequelizeModule.forFeature([
    Order,PaymentTransaction,Refund,PaymentWebhookEvent
  ])],
  controllers:[PaymentsController],
  providers:[PaymentsService],
  exports:[PaymentsService],
})
export class PaymentsModule {}
