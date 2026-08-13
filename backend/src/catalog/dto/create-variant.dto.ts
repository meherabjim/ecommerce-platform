import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, Length, Min } from 'class-validator';
export class CreateVariantDto {
  @IsString() productId:string;
  @IsString() @Length(1,80) sku:string;
  @IsString() @Length(1,30) variantCode:string;
  @IsObject() attributes:Record<string,string>;
  @IsNumber() @Min(0) price:number;
  @IsOptional() @IsNumber() @Min(0) salePrice?:number;
  @IsOptional() @IsNumber() @Min(0) costPrice?:number;
  @IsOptional() @IsNumber() @Min(0) weight?:number;
  @IsOptional() @IsString() imageUrl?:string;
  @IsOptional() @IsBoolean() active?:boolean;
  @IsOptional() @IsNumber() @Min(0) openingStock?:number;
}
