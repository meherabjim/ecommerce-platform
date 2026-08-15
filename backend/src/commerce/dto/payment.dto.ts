import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  PaymentStatus,
} from '../models/order.model';


export class UpdatePaymentStatusDto {

  @IsEnum(PaymentStatus)
  status:PaymentStatus;

  @IsOptional()
  @IsString()
  note?:string;
}
