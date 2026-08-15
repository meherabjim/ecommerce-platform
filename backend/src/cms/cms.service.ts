import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { StoreSetting } from './models/store-setting.model';
import { HomepageSection } from './models/homepage-section.model';
import { ContentBlock } from './models/content-block.model';
import { CmsPage, CmsPageStatus } from './models/cms-page.model';
import {
  CreateCmsPageDto, CreateContentBlockDto, CreateSectionDto,
  UpdateCmsPageDto, UpdateContentBlockDto, UpdateSectionDto,
  UpsertSettingDto,
} from './dto/cms.dto';

@Injectable()
export class CmsService {
  constructor(
    @InjectModel(StoreSetting) private readonly settingModel:typeof StoreSetting,
    @InjectModel(HomepageSection) private readonly sectionModel:typeof HomepageSection,
    @InjectModel(ContentBlock) private readonly blockModel:typeof ContentBlock,
    @InjectModel(CmsPage) private readonly pageModel:typeof CmsPage,
  ) {}

  async settings(){
    const rows=await this.settingModel.findAll({order:[['groupName','ASC'],['key','ASC']]});
    return rows;
  }

  async publicSettings(){
    const rows=await this.settings();
    return Object.fromEntries(rows.map(x=>[x.key,x.value]));
  }

  async upsertSetting(key:string,dto:UpsertSettingDto){
    const clean=key.trim();
    const existing=await this.settingModel.findOne({where:{key:clean}});
    if(existing){
      existing.value=dto.value;
      if(dto.groupName!==undefined) existing.groupName=dto.groupName;
      if(dto.description!==undefined) existing.description=dto.description;
      await existing.save();
      return existing;
    }
    return this.settingModel.create({
      key:clean,
      value:dto.value,
      groupName:dto.groupName||'GENERAL',
      description:dto.description||null,
    } as any);
  }

  async sections(admin=false){
    if(admin) return this.sectionModel.findAll({order:[['sortOrder','ASC'],['createdAt','ASC']]});
    const now=new Date();
    return this.sectionModel.findAll({
      where:{
        enabled:true,
        [Op.and]:[
          {[Op.or]:[{scheduleFrom:null},{scheduleFrom:{[Op.lte]:now}}]},
          {[Op.or]:[{scheduleTo:null},{scheduleTo:{[Op.gte]:now}}]},
        ],
      },
      order:[['sortOrder','ASC'],['createdAt','ASC']],
    });
  }

  createSection(dto:CreateSectionDto){
    return this.sectionModel.create({
      ...dto,
      type:dto.type.trim().toUpperCase(),
      title:dto.title||null,
      subtitle:dto.subtitle||null,
      enabled:dto.enabled??true,
      sortOrder:dto.sortOrder??0,
      config:dto.config||{},
      scheduleFrom:dto.scheduleFrom?new Date(dto.scheduleFrom):null,
      scheduleTo:dto.scheduleTo?new Date(dto.scheduleTo):null,
    } as any);
  }

  async updateSection(id:string,dto:UpdateSectionDto){
    const row=await this.sectionModel.findByPk(id);
    if(!row) throw new NotFoundException('Homepage section not found.');
    if(dto.type!==undefined) row.type=dto.type.trim().toUpperCase();
    if(dto.title!==undefined) row.title=dto.title||null;
    if(dto.subtitle!==undefined) row.subtitle=dto.subtitle||null;
    if(dto.enabled!==undefined) row.enabled=dto.enabled;
    if(dto.sortOrder!==undefined) row.sortOrder=dto.sortOrder;
    if(dto.config!==undefined) row.config=dto.config;
    if(dto.scheduleFrom!==undefined) row.scheduleFrom=dto.scheduleFrom?new Date(dto.scheduleFrom):null;
    if(dto.scheduleTo!==undefined) row.scheduleTo=dto.scheduleTo?new Date(dto.scheduleTo):null;
    await row.save();
    return row;
  }

  async deleteSection(id:string){
    const count=await this.sectionModel.destroy({where:{id}});
    if(!count) throw new NotFoundException('Homepage section not found.');
    return {deleted:true};
  }

  blocks(kind?:string,admin=false){
    const where:any={};
    if(kind) where.kind=kind.toUpperCase();
    if(!admin) where.active=true;
    return this.blockModel.findAll({where,order:[['sortOrder','ASC'],['createdAt','ASC']]});
  }

  createBlock(dto:CreateContentBlockDto){
    return this.blockModel.create({
      ...dto,
      kind:dto.kind.trim().toUpperCase(),
      subtitle:dto.subtitle||null,
      body:dto.body||null,
      imageUrl:dto.imageUrl||null,
      linkLabel:dto.linkLabel||null,
      linkUrl:dto.linkUrl||null,
      active:dto.active??true,
      sortOrder:dto.sortOrder??0,
      metadata:dto.metadata||{},
    } as any);
  }

  async updateBlock(id:string,dto:UpdateContentBlockDto){
    const row=await this.blockModel.findByPk(id);
    if(!row) throw new NotFoundException('Content block not found.');
    Object.assign(row,{
      ...dto,
      kind:dto.kind?.trim().toUpperCase()??row.kind,
      subtitle:dto.subtitle===undefined?row.subtitle:(dto.subtitle||null),
      body:dto.body===undefined?row.body:(dto.body||null),
      imageUrl:dto.imageUrl===undefined?row.imageUrl:(dto.imageUrl||null),
      linkLabel:dto.linkLabel===undefined?row.linkLabel:(dto.linkLabel||null),
      linkUrl:dto.linkUrl===undefined?row.linkUrl:(dto.linkUrl||null),
      metadata:dto.metadata??row.metadata,
    });
    await row.save();
    return row;
  }

  async deleteBlock(id:string){
    const count=await this.blockModel.destroy({where:{id}});
    if(!count) throw new NotFoundException('Content block not found.');
    return {deleted:true};
  }

  pages(admin=false){
    return this.pageModel.findAll({
      where:admin?{}:{status:CmsPageStatus.PUBLISHED},
      order:[['sortOrder','ASC'],['title','ASC']],
    });
  }

  async pageBySlug(slug:string){
    const row=await this.pageModel.findOne({
      where:{slug,status:CmsPageStatus.PUBLISHED},
    });
    if(!row) throw new NotFoundException('Page not found.');
    return row;
  }

  async pageById(id:string){
    const row=await this.pageModel.findByPk(id);
    if(!row) throw new NotFoundException('Page not found.');
    return row;
  }

  async createPage(dto:CreateCmsPageDto){
    const slug=this.cleanSlug(dto.slug);
    if(await this.pageModel.findOne({where:{slug}})) throw new BadRequestException('Page slug already exists.');
    return this.pageModel.create({
      ...dto,
      slug,
      body:dto.body||'',
      status:dto.status||CmsPageStatus.DRAFT,
      metaTitle:dto.metaTitle||null,
      metaDescription:dto.metaDescription||null,
      sortOrder:dto.sortOrder??0,
      publishedAt:dto.status===CmsPageStatus.PUBLISHED?new Date():null,
    } as any);
  }

  async updatePage(id:string,dto:UpdateCmsPageDto){
    const row=await this.pageById(id);
    const slug=this.cleanSlug(dto.slug);
    const duplicate=await this.pageModel.findOne({where:{slug,id:{[Op.ne]:id}} as any});
    if(duplicate) throw new BadRequestException('Page slug already exists.');
    const wasPublished=row.status===CmsPageStatus.PUBLISHED;
    Object.assign(row,{
      ...dto,
      slug,
      body:dto.body??row.body,
      status:dto.status??row.status,
      metaTitle:dto.metaTitle===undefined?row.metaTitle:(dto.metaTitle||null),
      metaDescription:dto.metaDescription===undefined?row.metaDescription:(dto.metaDescription||null),
      sortOrder:dto.sortOrder??row.sortOrder,
    });
    if(!wasPublished&&row.status===CmsPageStatus.PUBLISHED) row.publishedAt=new Date();
    await row.save();
    return row;
  }

  async deletePage(id:string){
    const count=await this.pageModel.destroy({where:{id}});
    if(!count) throw new NotFoundException('Page not found.');
    return {deleted:true};
  }

  private cleanSlug(input:string){
    const slug=input.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
    if(!slug) throw new BadRequestException('A valid page slug is required.');
    return slug;
  }

  async publicHome(){
    const [settings,sections,blocks,pages]=await Promise.all([
      this.publicSettings(),
      this.sections(false),
      this.blocks(undefined,false),
      this.pages(false),
    ]);
    return {settings,sections,blocks,pages};
  }

  async bulkUpsertSettings(items:{key:string;value:any;groupName?:string;description?:string}[]){
    const saved:any[]=[];
    for(const item of items||[]){
      if(!item?.key?.trim()) continue;
      saved.push(await this.upsertSetting(item.key,{
        value:item.value,
        groupName:item.groupName,
        description:item.description,
      } as any));
    }
    return saved;
  }

}
