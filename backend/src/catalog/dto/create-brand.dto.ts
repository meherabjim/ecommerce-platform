import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
export class CreateBrandDto {
  @IsString() @Length(2,120) name:string;
  @IsOptional() @IsString() logoUrl?:string;
  @IsOptional() @IsString() description?:string;
  @IsOptional() @IsBoolean() active?:boolean;
}
