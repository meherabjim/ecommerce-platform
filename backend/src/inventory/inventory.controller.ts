import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { CreateWarehouseDto, UpdateReorderLevelDto } from './dto/inventory-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
@Controller('inventory') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
export class InventoryController {
  constructor(private service:InventoryService){}
  @Get() summary(){return this.service.stockSummary();}
  @Get('dashboard') dashboard(){return this.service.dashboard();}
  @Post('adjust') adjust(@Body() dto:AdjustInventoryDto){return this.service.adjust(dto);}
  @Get('warehouses') warehouses(){return this.service.warehouses();}
  @Get('movements') movements(){return this.service.movements();}
  @Get('low-stock') lowStock(){return this.service.lowStock();}
  @Post('warehouses') createWarehouse(@Body() dto:CreateWarehouseDto){return this.service.createWarehouse(dto);}
  @Post('reorder-level') reorder(@Body() dto:UpdateReorderLevelDto){return this.service.setReorderLevel(dto);}
}
