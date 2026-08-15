import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CourierController } from './courier.controller';
import { CourierService } from './courier.service';
import { CourierShipment } from './models/courier-shipment.model';
import { ShipmentEvent } from './models/shipment-event.model';
import { CourierWebhookEvent } from './models/courier-webhook-event.model';
import { CodReconciliation } from './models/cod-reconciliation.model';
import { Order } from '../commerce/models/order.model';
import { ShippingZone } from '../customer/models/shipping-zone.model';

@Module({
  imports:[SequelizeModule.forFeature([
    Order,CourierShipment,ShipmentEvent,CourierWebhookEvent,CodReconciliation,ShippingZone
  ])],
  controllers:[CourierController],
  providers:[CourierService],
  exports:[CourierService],
})
export class CourierModule {}
