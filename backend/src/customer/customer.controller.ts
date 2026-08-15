import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  CustomerService,
} from './customer.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import { NotificationType } from './models/notification.model';

import {
  UserRole,
} from '../common/enums/user-role.enum';

import {
  ModerateReturnDto,
  ReturnRequestDto,
  ShippingZoneDto,
} from './dto/customer.dto';


@Controller()
export class CustomerController {

  constructor(
    private readonly service:
      CustomerService,
  ){}


  // ========================================================
  // PUBLIC SHIPPING QUOTE
  // ========================================================

  @Get('shipping/quote')
  quote(
    @Query('district')
    district:string,

    @Query('area')
    area:string,

    @Query('subtotal')
    subtotal:string,
  ) {

    return this.service.shippingQuote(
      district,
      area,
      Number(subtotal || 0),
    );
  }


  // ========================================================
  // ADMIN SHIPPING
  // ========================================================

  @Get('admin/shipping-zones')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  shippingZones() {
    return this.service.listShippingZones();
  }


  @Post('admin/shipping-zones')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  createShippingZone(
    @Body()
    dto:ShippingZoneDto,
  ) {
    return this.service.createShippingZone(
      dto,
    );
  }


  @Patch('admin/shipping-zones/:id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  updateShippingZone(
    @Param('id')
    id:string,

    @Body()
    dto:ShippingZoneDto,
  ) {
    return this.service.updateShippingZone(
      id,
      dto,
    );
  }


  @Delete('admin/shipping-zones/:id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  deleteShippingZone(
    @Param('id')
    id:string,
  ) {
    return this.service.deleteShippingZone(
      id,
    );
  }


  // ========================================================
  // WISHLIST
  // ========================================================

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  wishlist(
    @CurrentUser()
    user:any,
  ) {
    return this.service.wishlist(
      user.id,
    );
  }


  @Post('wishlist/:productId')
  @UseGuards(JwtAuthGuard)
  addWishlist(
    @CurrentUser()
    user:any,

    @Param('productId')
    productId:string,
  ) {
    return this.service.addWishlist(
      user.id,
      productId,
    );
  }


  @Delete('wishlist/:productId')
  @UseGuards(JwtAuthGuard)
  removeWishlist(
    @CurrentUser()
    user:any,

    @Param('productId')
    productId:string,
  ) {
    return this.service.removeWishlist(
      user.id,
      productId,
    );
  }


  // ========================================================
  // NOTIFICATIONS
  // ========================================================

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  notifications(
    @CurrentUser()
    user:any,
  ) {
    return this.service.notifications(
      user.id,
    );
  }


  @Post('notifications/promotion')
  @UseGuards(JwtAuthGuard)
  promotionNotification(
    @CurrentUser() user:any,
    @Body() dto:{promotionId:string;code:string;name?:string;type?:string;value?:number|string;minOrder?:number|string},
  ) {
    return this.service.ensurePromotionNotification(user.id,dto);
  }


  @Patch('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  markRead(
    @CurrentUser()
    user:any,

    @Param('id')
    id:string,
  ) {
    return this.service.markNotificationRead(
      user.id,
      id,
    );
  }


  // ========================================================
  // RETURNS
  // ========================================================

  @Get('returns')
  @UseGuards(JwtAuthGuard)
  returns(
    @CurrentUser()
    user:any,
  ) {
    return this.service.myReturns(
      user.id,
    );
  }


  @Post('orders/:orderId/return')
  @UseGuards(JwtAuthGuard)
  requestReturn(
    @CurrentUser()
    user:any,

    @Param('orderId')
    orderId:string,

    @Body()
    dto:ReturnRequestDto,
  ) {
    return this.service.requestReturn(
      user.id,
      orderId,
      dto.reason,
    );
  }


  @Get('admin/returns')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  adminReturns() {
    return this.service.allReturns();
  }


  @Patch('admin/returns/:id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.ADMIN)
  moderateReturn(
    @Param('id')
    id:string,

    @Body()
    dto:ModerateReturnDto,
  ) {
    return this.service.moderateReturn(
      id,
      dto.status,
      dto.adminNote,
    );
  }

  @Patch('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  markAllRead(@CurrentUser() user:any) {
    return this.service.markAllNotificationsRead(user.id);
  }

  @Get('admin/notifications')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  adminNotifications() {
    return this.service.adminNotifications();
  }

  @Post('admin/notifications/broadcast')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  broadcastNotification(@Body() dto:{type?:NotificationType;title:string;message:string}) {
    return this.service.broadcastNotification(dto.type||NotificationType.SYSTEM,dto.title,dto.message);
  }

}
