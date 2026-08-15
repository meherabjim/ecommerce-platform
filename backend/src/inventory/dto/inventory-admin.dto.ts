import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateReorderLevelDto {
  @IsUUID()
  variantId!: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsInt()
  @Min(0)
  reorderLevel!: number;
}
