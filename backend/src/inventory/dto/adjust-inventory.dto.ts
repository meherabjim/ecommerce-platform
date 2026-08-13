import { IsInt, IsOptional, IsString } from 'class-validator';
export class AdjustInventoryDto { @IsString() variantId:string; @IsInt() quantity:number; @IsOptional() @IsString() warehouseId?:string; @IsOptional() @IsString() note?:string; }
