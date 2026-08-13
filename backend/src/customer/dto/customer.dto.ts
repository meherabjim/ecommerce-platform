import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ReturnStatus,
} from '../models/return-request.model';

export class ReturnRequestDto {

  @IsString()
  @MaxLength(500)
  reason:string;
}

export class ModerateReturnDto {

  @IsEnum(ReturnStatus)
  status:ReturnStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?:string;
}
