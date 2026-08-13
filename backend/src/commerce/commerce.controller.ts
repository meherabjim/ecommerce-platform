import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommerceService } from './commerce.service';import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';import { CurrentUser } from '../auth/decorators/current-user.decorator';import { AddCartItemDto,UpdateCartItemDto } from './dto/cart.dto';import { CheckoutDto } from './dto/checkout.dto';import { UpdateOrderStatusDto } from './dto/update-order-status.dto';import { AssignDeliveryDto,DeliveryStatusDto } from './dto/delivery.dto';import { RolesGuard } from '../auth/guards/roles.guard';import { Roles } from '../auth/decorators/roles.decorator';import { UserRole } from '../common/enums/user-role.enum';
@Controller()
export class CommerceController{
 constructor(private s:CommerceService){}
 @Get('cart')@UseGuards(JwtAuthGuard)cart(@CurrentUser()u:any){return this.s.getCart(u.id)}
 @Post('cart/items')@UseGuards(JwtAuthGuard)add(@CurrentUser()u:any,@Body()d:AddCartItemDto){return this.s.add(u.id,d)}
 @Patch('cart/items/:id')@UseGuards(JwtAuthGuard)update(@CurrentUser()u:any,@Param('id')id:string,@Body()d:UpdateCartItemDto){return this.s.update(u.id,id,d)}
 @Delete('cart/items/:id')@UseGuards(JwtAuthGuard)remove(@CurrentUser()u:any,@Param('id')id:string){return this.s.remove(u.id,id)}
 @Post('checkout')@UseGuards(JwtAuthGuard)checkout(@CurrentUser()u:any,@Body()d:CheckoutDto){return this.s.checkout(u.id,d)}
 @Get('me/orders')@UseGuards(JwtAuthGuard)myOrders(@CurrentUser()u:any){return this.s.ordersForUser(u.id)}
 @Get('me/orders/:id')@UseGuards(JwtAuthGuard)myOrder(@CurrentUser()u:any,@Param('id')id:string){return this.s.orderDetails(id,u.id,false)}
 @Get('admin/orders')@UseGuards(JwtAuthGuard,RolesGuard)@Roles(UserRole.ADMIN)orders(){return this.s.allOrders()}
 @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  adminOrder(@Param('id') id:string){
    return this.s.orderDetails(id,undefined,true);
  }

  @Patch('admin/orders/:id/status')@UseGuards(JwtAuthGuard,RolesGuard)@Roles(UserRole.ADMIN)status(@CurrentUser()u:any,@Param('id')id:string,@Body()d:UpdateOrderStatusDto){return this.s.updateStatus(id,d.status,u.id,d.note)}
 @Patch('admin/orders/:id/assign-delivery')@UseGuards(JwtAuthGuard,RolesGuard)@Roles(UserRole.ADMIN)assign(@CurrentUser()u:any,@Param('id')id:string,@Body()d:AssignDeliveryDto){return this.s.assignDeliveryAgent(id,d.deliveryAgentId,u.id)}
 @Get('delivery/orders')@UseGuards(JwtAuthGuard,RolesGuard)@Roles(UserRole.DELIVERY_AGENT)deliveryOrders(@CurrentUser()u:any){return this.s.deliveryOrders(u.id)}
 @Patch('delivery/orders/:id/status')@UseGuards(JwtAuthGuard,RolesGuard)@Roles(UserRole.DELIVERY_AGENT)deliveryStatus(@CurrentUser()u:any,@Param('id')id:string,@Body()d:DeliveryStatusDto){return this.s.updateDeliveryStatus(id,u.id,d.status,d.note,d.failureReason,d.codCollected)}
}

