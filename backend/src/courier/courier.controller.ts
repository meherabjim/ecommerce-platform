import {
  Body, Controller, Get, Headers, Param, Patch, Post, UseGuards,
} from '@nestjs/common';

import { CourierService } from './courier.service';
import {
  CreateShipmentDto, ReconcileCodDto, ShipmentStatusDto,
} from './dto/courier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('courier')
export class CourierController {
  constructor(private readonly service:CourierService){}

  @Get('me/orders/:id') @UseGuards(JwtAuthGuard)
  myOrder(@CurrentUser() user:any,@Param('id') id:string){
    return this.service.byOrder(id,user.id,false)
  }

  @Get('admin/recommendation/:orderId')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  recommendation(@Param('orderId') orderId:string){return this.service.recommendation(orderId)}

  @Get('admin/shipments')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  all(){return this.service.all()}

  @Get('admin/shipments/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  details(@Param('id') id:string){return this.service.details(id)}

  @Post('admin/shipments')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  create(@CurrentUser() user:any,@Body() dto:CreateShipmentDto){
    return this.service.create(dto,user.id)
  }

  @Patch('admin/shipments/:id/status')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  status(@Param('id') id:string,@Body() dto:ShipmentStatusDto){
    return this.service.updateStatus(id,dto)
  }

  @Patch('admin/shipments/:id/reconciliation')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  reconcile(@CurrentUser() user:any,@Param('id') id:string,@Body() dto:ReconcileCodDto){
    return this.service.reconcile(id,dto,user.id)
  }

  @Post('webhooks/:provider')
  webhook(
    @Param('provider') provider:string,
    @Headers('x-event-key') eventKey:string,
    @Headers('x-signature-valid') signatureValid:string,
    @Body() payload:any,
  ){
    return this.service.webhook(provider,eventKey,payload,signatureValid==='true')
  }
}
