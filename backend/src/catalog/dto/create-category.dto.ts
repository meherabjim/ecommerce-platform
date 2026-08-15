import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Length, Matches, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @Length(2,120) name:string;
  @IsOptional() @IsString() @Length(2,120) nameBn?:string;
  @IsString() @Matches(/^\d{2}$/,{message:'barcodePrefix must be exactly 2 digits.'}) barcodePrefix:string;
  @IsOptional() @IsString() description?:string;
  @IsOptional() @IsString() descriptionBn?:string;
  @IsOptional() @IsString() imageUrl?:string;
  @IsOptional() @IsUUID() parentId?:string;
  @IsOptional() @IsInt() @Min(0) sortOrder?:number;
  @IsOptional() @IsBoolean() featuredInNav?:boolean;
  @IsOptional() @IsBoolean() active?:boolean;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @Length(2,120) name?:string;
  @IsOptional() @IsString() @Length(2,120) nameBn?:string;
  @IsOptional() @IsString() description?:string;
  @IsOptional() @IsString() descriptionBn?:string;
  @IsOptional() @IsString() imageUrl?:string;
  @IsOptional() @IsUUID() parentId?:string;
  @IsOptional() @IsInt() @Min(0) sortOrder?:number;
  @IsOptional() @IsBoolean() featuredInNav?:boolean;
  @IsOptional() @IsBoolean() active?:boolean;
}
