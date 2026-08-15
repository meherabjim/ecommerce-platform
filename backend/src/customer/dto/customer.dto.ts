import {
  IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';
import { ReturnStatus } from '../models/return-request.model';
import { DeliveryMode } from '../models/shipping-zone.model';

export class ReturnRequestDto {
  @IsString() @MaxLength(500)
  reason:string;
}

export class ModerateReturnDto {
  @IsEnum(ReturnStatus)
  status:ReturnStatus;

  @IsOptional() @IsString() @MaxLength(500)
  adminNote?:string;
}

export class ShippingZoneDto {
  @IsString()
  district:string;

  @IsOptional() @IsString()
  area?:string;

  @IsNumber() @Min(0)
  charge:number;

  @IsNumber() @Min(0)
  freeShippingThreshold:number;

  @IsOptional() @IsBoolean()
  active?:boolean;

  @IsOptional() @IsEnum(DeliveryMode)
  deliveryMode?:DeliveryMode;

  @IsOptional() @IsString() @MaxLength(60)
  preferredProvider?:string;

  @IsOptional() @IsBoolean()
  internalServiceable?:boolean;
}
