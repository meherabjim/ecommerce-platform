import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PromotionType } from '../models/promotion.model';

export class CreatePromotionDto {
  @IsString() code:string;
  @IsString() name:string;
  @IsEnum(PromotionType) type:PromotionType;
  @IsNumber() @Min(0) value:number;
  @IsOptional() @IsNumber() @Min(0) minOrder?:number;
  @IsOptional() @IsNumber() @Min(0) maxDiscount?:number;
  @IsOptional() @IsDateString() startsAt?:string;
  @IsOptional() @IsDateString() endsAt?:string;
  @IsOptional() @IsInt() @Min(1) usageLimit?:number;
  @IsOptional() @IsBoolean() active?:boolean;
  @IsOptional() @IsBoolean() featured?:boolean;
}
