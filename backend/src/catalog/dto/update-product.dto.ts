import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ProductStatus } from '../models/product.model';

export class UpdateProductDto {
  @IsOptional() @IsString() @Length(2,180) name?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() brandId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() primaryImageUrl?: string;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsBoolean() featured?: boolean;
}
