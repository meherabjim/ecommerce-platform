import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaymentMode } from '../models/order.model';
export class CheckoutDto {
  @IsOptional() @IsString() addressId?:string;
  @IsString() @Length(2,120) customerName:string;
  @IsString() @Length(7,30) phone:string;
  @IsOptional() @IsEmail() email?:string;
  @IsString() @Length(5,300) addressLine:string;
  @IsString() @Length(2,100) city:string;
  @IsOptional() @IsString() division?:string;
  @IsOptional() @IsString() district?:string;
  @IsOptional() @IsString() area?:string;
  @IsOptional() @IsString() landmark?:string;
  @IsOptional() @IsString() postalCode?:string;
  @IsOptional() @IsString() addressLabel?:string;
  @IsOptional() @IsString() notes?:string;
  @IsEnum(PaymentMode) paymentMode:PaymentMode;
  @IsOptional() @IsString() couponCode?:string;
}
