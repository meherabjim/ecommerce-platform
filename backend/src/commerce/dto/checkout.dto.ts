import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import { PaymentMode } from '../models/order.model';

export class CheckoutDto {
  @IsOptional()
  @IsString()
  addressId?: string;

  @IsString()
  @Length(2, 120)
  customerName: string;

  @IsString()
  @Length(7, 30)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(5, 300)
  addressLine: string;

  @IsString()
  @Length(2, 100)
  city: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  addressLabel?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  locationSource?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
