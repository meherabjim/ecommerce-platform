import {
  IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min,
} from 'class-validator';
import { ShipmentStatus } from '../models/courier-shipment.model';
import { CodReconciliationStatus } from '../models/cod-reconciliation.model';

export class CreateShipmentDto {
  @IsUUID()
  orderId!:string;

  @IsOptional() @IsString() @MaxLength(60)
  provider?:string;

  @IsOptional() @IsString() @MaxLength(180)
  consignmentId?:string;

  @IsOptional() @IsString() @MaxLength(180)
  trackingCode?:string;

  @IsOptional() @IsString()
  trackingUrl?:string;

  @IsOptional() @IsNumber({maxDecimalPlaces:2}) @Min(0)
  deliveryFee?:number;
}

export class ShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status!:ShipmentStatus;

  @IsOptional() @IsString() @MaxLength(120)
  providerStatus?:string;

  @IsOptional() @IsString() @MaxLength(500)
  note?:string;

  @IsOptional() @IsString() @MaxLength(500)
  failureReason?:string;
}

export class ReconcileCodDto {
  @IsNumber({maxDecimalPlaces:2}) @Min(0)
  collectedAmount!:number;

  @IsNumber({maxDecimalPlaces:2}) @Min(0)
  settledAmount!:number;

  @IsEnum(CodReconciliationStatus)
  status!:CodReconciliationStatus;

  @IsOptional() @IsString() @MaxLength(180)
  settlementReference?:string;

  @IsOptional() @IsString() @MaxLength(500)
  note?:string;
}
