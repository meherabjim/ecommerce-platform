import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';

import { CmsService } from './cms.service';
import {
  CreateCmsPageDto, CreateContentBlockDto, CreateSectionDto,
  UpdateCmsPageDto, UpdateContentBlockDto, UpdateSectionDto,
  UpsertSettingDto, BulkSettingsDto,
} from './dto/cms.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('cms')
export class CmsController {
  constructor(private readonly service:CmsService){}

  @Get('public/home')
  publicHome(){return this.service.publicHome()}

  @Get('public/settings')
  publicSettings(){return this.service.publicSettings()}

  @Get('public/pages')
  publicPages(){return this.service.pages(false)}

  @Get('public/pages/:slug')
  publicPage(@Param('slug') slug:string){return this.service.pageBySlug(slug)}

  @Get('public/blocks')
  publicBlocks(@Query('kind') kind?:string){return this.service.blocks(kind,false)}

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  settings(){return this.service.settings()}


  @Patch('admin/settings')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  bulkSettings(@Body() dto:BulkSettingsDto){
    return this.service.bulkUpsertSettings(dto.items||[])
  }

  @Patch('admin/settings/:key')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  upsertSetting(@Param('key') key:string,@Body() dto:UpsertSettingDto){
    return this.service.upsertSetting(key,dto)
  }

  @Get('admin/sections')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  sections(){return this.service.sections(true)}

  @Post('admin/sections')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  createSection(@Body() dto:CreateSectionDto){return this.service.createSection(dto)}

  @Patch('admin/sections/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  updateSection(@Param('id') id:string,@Body() dto:UpdateSectionDto){
    return this.service.updateSection(id,dto)
  }

  @Delete('admin/sections/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  deleteSection(@Param('id') id:string){return this.service.deleteSection(id)}

  @Get('admin/blocks')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  blocks(@Query('kind') kind?:string){return this.service.blocks(kind,true)}

  @Post('admin/blocks')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  createBlock(@Body() dto:CreateContentBlockDto){return this.service.createBlock(dto)}

  @Patch('admin/blocks/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  updateBlock(@Param('id') id:string,@Body() dto:UpdateContentBlockDto){
    return this.service.updateBlock(id,dto)
  }

  @Delete('admin/blocks/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  deleteBlock(@Param('id') id:string){return this.service.deleteBlock(id)}

  @Get('admin/pages')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  pages(){return this.service.pages(true)}

  @Post('admin/pages')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  createPage(@Body() dto:CreateCmsPageDto){return this.service.createPage(dto)}

  @Patch('admin/pages/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  updatePage(@Param('id') id:string,@Body() dto:UpdateCmsPageDto){
    return this.service.updatePage(id,dto)
  }

  @Delete('admin/pages/:id')
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
  deletePage(@Param('id') id:string){return this.service.deletePage(id)}
}
