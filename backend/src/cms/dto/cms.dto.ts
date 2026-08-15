import {
  IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString,
  IsUrl, MaxLength, Min,
} from 'class-validator';
import { CmsPageStatus } from '../models/cms-page.model';

export class UpsertSettingDto {
  @IsObject()
  value!:Record<string,any>;

  @IsOptional() @IsString() @MaxLength(80)
  groupName?:string;

  @IsOptional() @IsString() @MaxLength(255)
  description?:string;
}

export class CreateSectionDto {
  @IsString() @MaxLength(80)
  type!:string;

  @IsOptional() @IsString() @MaxLength(180)
  title?:string;

  @IsOptional() @IsString() @MaxLength(300)
  subtitle?:string;

  @IsOptional() @IsBoolean()
  enabled?:boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?:number;

  @IsOptional() @IsObject()
  config?:Record<string,any>;

  @IsOptional() @IsString()
  scheduleFrom?:string;

  @IsOptional() @IsString()
  scheduleTo?:string;
}

export class UpdateSectionDto extends CreateSectionDto {}

export class CreateContentBlockDto {
  @IsString() @MaxLength(80)
  kind!:string;

  @IsString() @MaxLength(180)
  title!:string;

  @IsOptional() @IsString() @MaxLength(300)
  subtitle?:string;

  @IsOptional() @IsString()
  body?:string;

  @IsOptional() @IsString()
  imageUrl?:string;

  @IsOptional() @IsString() @MaxLength(100)
  linkLabel?:string;

  @IsOptional() @IsString()
  linkUrl?:string;

  @IsOptional() @IsBoolean()
  active?:boolean;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?:number;

  @IsOptional() @IsObject()
  metadata?:Record<string,any>;
}

export class UpdateContentBlockDto extends CreateContentBlockDto {}

export class CreateCmsPageDto {
  @IsString() @MaxLength(160)
  slug!:string;

  @IsString() @MaxLength(220)
  title!:string;

  @IsOptional() @IsString()
  body?:string;

  @IsOptional() @IsEnum(CmsPageStatus)
  status?:CmsPageStatus;

  @IsOptional() @IsString() @MaxLength(220)
  metaTitle?:string;

  @IsOptional() @IsString() @MaxLength(320)
  metaDescription?:string;

  @IsOptional() @IsInt() @Min(0)
  sortOrder?:number;
}

export class UpdateCmsPageDto extends CreateCmsPageDto {}


export class BulkSettingItemDto {
  @IsString()
  key!:string;

  value:any;

  @IsOptional()
  @IsString()
  groupName?:string;

  @IsOptional()
  @IsString()
  description?:string;
}

export class BulkSettingsDto {
  items!:BulkSettingItemDto[];
}
