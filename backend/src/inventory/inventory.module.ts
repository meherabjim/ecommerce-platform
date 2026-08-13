import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Warehouse } from './models/warehouse.model'; import { Inventory } from './models/inventory.model'; import { InventoryMovement } from './models/inventory-movement.model';
import { InventoryService } from './inventory.service'; import { InventoryController } from './inventory.controller';
@Module({imports:[SequelizeModule.forFeature([Warehouse,Inventory,InventoryMovement])],providers:[InventoryService],controllers:[InventoryController],exports:[InventoryService]})
export class InventoryModule {}
