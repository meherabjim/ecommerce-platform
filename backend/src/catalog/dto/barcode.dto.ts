import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';

export class BarcodeLabelsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsUUID('4', { each: true })
  variantIds!: string[];
}

export class BarcodePreviewDto {
  @IsUUID()
  productId!: string;

  @IsString()
  variantCode!: string;
}
