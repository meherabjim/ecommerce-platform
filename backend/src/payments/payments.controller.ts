import {
  Body, Controller, Get, Headers, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import {
  CreateRefundDto, ManualPaymentDto, TransactionStatusDto, UpdateRefundDto,
} from './dto/payment-ledger.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service:PaymentsService){}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user:any){return this.service.userTransactions(user.id)}

  @Get('me/orders/:id')
  @UseGuards(JwtAuthGuard)
  myLedger(@CurrentUser() user:any,@Param('id') id:string){
    return this.service.ledger(id,user.id,false)
  }

  @Get('admin/transactions')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  transactions(){return this.service.allTransactions()}

  @Get('admin/refunds')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  refunds(){return this.service.allRefunds()}

  @Get('admin/orders/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  orderLedger(@Param('id') id:string){return this.service.ledger(id,undefined,true)}

  @Post('admin/manual')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  manual(@CurrentUser() user:any,@Body() dto:ManualPaymentDto){
    return this.service.manualPayment(dto,user.id)
  }

  @Patch('admin/transactions/:id/status')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  transactionStatus(@Param('id') id:string,@Body() dto:TransactionStatusDto){
    return this.service.setTransactionStatus(id,dto)
  }

  @Post('admin/refunds')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  createRefund(@CurrentUser() user:any,@Body() dto:CreateRefundDto){
    return this.service.createRefund(dto,user.id)
  }

  @Patch('admin/refunds/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  updateRefund(@CurrentUser() user:any,@Param('id') id:string,@Body() dto:UpdateRefundDto){
    return this.service.updateRefund(id,dto,user.id)
  }

  @Post('webhooks/:provider')
  webhook(
    @Param('provider') provider:string,
    @Headers('x-event-key') eventKey:string,
    @Headers('x-signature-valid') signatureValid:string,
    @Body() payload:any,
  ){
    return this.service.webhook(
      provider,
      eventKey,
      signatureValid==='true'?payload:{...payload},
      signatureValid==='true',
    )
  }
}
