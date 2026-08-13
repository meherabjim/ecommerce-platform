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

import {
  UserRole,
} from '../common/enums/user-role.enum';

import {
  ModerateReturnDto,
  ReturnRequestDto,
} from './dto/customer.dto';


@Controller()
export class CustomerController {

  constructor(
    private readonly service:
      CustomerService,
  ){}


  // ========================================================
  // SHIPPING
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
}
