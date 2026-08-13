import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';
export class CreateCategoryDto {
  @IsString() @Length(2,120) name:string;
  @IsString() @Matches(/^\d{2}$/,{message:'barcodePrefix must be exactly 2 digits.'}) barcodePrefix:string;
  @IsOptional() @IsString() description?:string;
  @IsOptional() @IsString() imageUrl?:string;
  @IsOptional() @IsBoolean() active?:boolean;
}
