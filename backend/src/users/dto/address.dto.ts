import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import {
  AddressType,
  LocationSource,
} from '../models/address.model';

export class AddressDto {
  @IsString()
  @Length(2, 120)
  recipientName: string;

  @IsString()
  @Length(7, 30)
  phone: string;

  @IsEnum(AddressType)
  type: AddressType;

  @IsString()
  @Length(2, 80)
  division: string;

  @IsString()
  @Length(2, 100)
  district: string;

  @IsString()
  @Length(2, 120)
  area: string;

  @IsString()
  @Length(5, 300)
  addressLine: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

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
  @IsEnum(LocationSource)
  locationSource?: LocationSource;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateDeliveryAgentDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  email: string;

  @IsString()
  @Length(7, 30)
  phone: string;

  @IsString()
  @Length(8, 100)
  password: string;
}
