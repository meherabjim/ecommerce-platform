import {
  IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min,
} from 'class-validator';
import {
  PaymentTransactionStatus, PaymentTransactionType,
} from '../models/payment-transaction.model';
import { RefundStatus } from '../models/refund.model';

export class ManualPaymentDto {
  @IsUUID()
  orderId!:string;

  @IsNumber({maxDecimalPlaces:2})
  @Min(0.01)
  amount!:number;

  @IsOptional() @IsString() @MaxLength(60)
  provider?:string;

  @IsOptional() @IsString() @MaxLength(80)
  paymentMethod?:string;

  @IsOptional() @IsString() @MaxLength(180)
  externalReference?:string;

  @IsOptional() @IsString() @MaxLength(180)
  idempotencyKey?:string;

  @IsOptional() @IsEnum(PaymentTransactionType)
  type?:PaymentTransactionType;
}

export class TransactionStatusDto {
  @IsEnum(PaymentTransactionStatus)
  status!:PaymentTransactionStatus;

  @IsOptional() @IsString() @MaxLength(500)
  failedReason?:string;
}

export class CreateRefundDto {
  @IsUUID()
  orderId!:string;

  @IsOptional() @IsUUID()
  paymentTransactionId?:string;

  @IsNumber({maxDecimalPlaces:2})
  @Min(0.01)
  amount!:number;

  @IsString() @MaxLength(500)
  reason!:string;
}

export class UpdateRefundDto {
  @IsEnum(RefundStatus)
  status!:RefundStatus;

  @IsOptional() @IsString() @MaxLength(180)
  providerReference?:string;
}
