import { IsOptional, IsString, Length } from 'class-validator';
export class CreateAttributeGroupDto { @IsString() @Length(1,80) name:string; @IsString() @Length(1,100) code:string; }
export class CreateAttributeValueDto {
  @IsString() attributeGroupId:string; @IsString() @Length(1,100) value:string; @IsString() @Length(1,30) code:string; @IsOptional() sortOrder?:number;
}
