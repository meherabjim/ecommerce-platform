import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Category } from './models/category.model';
import { Brand } from './models/brand.model';
import { AttributeGroup } from './models/attribute-group.model';
import { AttributeValue } from './models/attribute-value.model';
import { Product, ProductStatus } from './models/product.model';
import { ProductVariant } from './models/product-variant.model';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateAttributeGroupDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { InventoryService } from '../inventory/inventory.service';

const slugify=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
function normalizeVariantCode(input:string){ const d=input.replace(/\D/g,''); if(d) return d.slice(-4).padStart(4,'0'); let h=0; for(const c of input.toUpperCase()) h=(h*31+c.charCodeAt(0))%10000; return String(h).padStart(4,'0'); }
function checksum2(firstTen:string){ const s=firstTen.split('').reduce((a,d,i)=>a+Number(d)*(i%2===0?3:7),0); return String(s%100).padStart(2,'0'); }

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectModel(Category) private categoryModel:typeof Category,
    @InjectModel(Brand) private brandModel:typeof Brand,
    @InjectModel(AttributeGroup) private groupModel:typeof AttributeGroup,
    @InjectModel(AttributeValue) private valueModel:typeof AttributeValue,
    @InjectModel(Product) private productModel:typeof Product,
    @InjectModel(ProductVariant) private variantModel:typeof ProductVariant,
    private sequelize:Sequelize,
    private inventory:InventoryService
  ){}

  async onModuleInit(){await this.seedDemoCatalog();}

  private async uniqueSlug(model:any,name:string,excludeId?:string){
    const base=slugify(name)||`item-${Date.now()}`; let s=base,i=1;
    while(true){
      const found=await model.findOne({where:{slug:s}});
      if(!found || found.id===excludeId) return s;
      s=`${base}-${i++}`;
    }
  }

  async seedDemoCatalog(){
    if(await this.categoryModel.count()) return;
    const c=await this.categoryModel.create({name:'Lifestyle',slug:'lifestyle',barcodePrefix:'12',description:'Demo category. Replace with your assigned sector.',active:true,nextBarcodeSerial:1} as any);
    const b=await this.brandModel.create({name:'Nova',slug:'nova',description:'Demo brand',active:true} as any);
    const p=await this.productModel.create({name:'Essential Everyday Item',slug:'essential-everyday-item',categoryId:c.id,brandId:b.id,shortDescription:'Seed product to verify the catalog pipeline.',description:'Replace this demo content from admin.',status:ProductStatus.ACTIVE,featured:true} as any);
    await this.createVariant({productId:p.id,sku:'NOVA-ESS-001',variantCode:'1',attributes:{Edition:'Standard'},price:1490,salePrice:1290,openingStock:25});
  }

  async createCategory(dto:CreateCategoryDto){
    if(await this.categoryModel.findOne({where:{barcodePrefix:dto.barcodePrefix}})) throw new ConflictException('Barcode prefix is already used.');
    if(dto.parentId && !await this.categoryModel.findByPk(dto.parentId)) throw new NotFoundException('Parent category not found.');
    return this.categoryModel.create({...dto,parentId:dto.parentId||null,slug:await this.uniqueSlug(this.categoryModel,dto.name),nextBarcodeSerial:1,sortOrder:dto.sortOrder??0,featuredInNav:dto.featuredInNav??false} as any);
  }

  async listCategories(publicOnly=false){
    const rows=await this.categoryModel.findAll({
      where:publicOnly?{active:true}:undefined,
      order:[['sortOrder','ASC'],['name','ASC']]
    });
    return rows.map(row=>row.toJSON());
  }

  async updateCategory(id:string,dto:UpdateCategoryDto){
    const row=await this.categoryModel.findByPk(id);
    if(!row) throw new NotFoundException('Category not found.');
    if(dto.parentId===id) throw new BadRequestException('A category cannot be its own parent.');
    if(dto.parentId && !await this.categoryModel.findByPk(dto.parentId)) throw new NotFoundException('Parent category not found.');
    if(dto.name && dto.name!==row.name) row.slug=await this.uniqueSlug(this.categoryModel,dto.name,row.id);
    Object.assign(row,dto);
    if((dto as any).parentId==='') row.parentId=null;
    await row.save();
    return row;
  }

  async deleteCategory(id:string){
    const row=await this.categoryModel.findByPk(id);
    if(!row) throw new NotFoundException('Category not found.');
    if(await this.productModel.count({where:{categoryId:id}})) throw new BadRequestException('Move products out of this category before deleting it.');
    if(await this.categoryModel.count({where:{parentId:id}})) throw new BadRequestException('Move or delete subcategories first.');
    await row.destroy();
    return {deleted:true};
  }

  async createBrand(dto:CreateBrandDto){return this.brandModel.create({...dto,slug:await this.uniqueSlug(this.brandModel,dto.name)} as any);}
  listBrands(publicOnly=false){return this.brandModel.findAll({where:publicOnly?{active:true}:undefined,order:[['name','ASC']]});}

  createAttributeGroup(dto:CreateAttributeGroupDto){return this.groupModel.create({name:dto.name.trim(),code:dto.code.trim().toUpperCase(),active:true} as any);}
  async createAttributeValue(dto:CreateAttributeValueDto){
    if(!await this.groupModel.findByPk(dto.attributeGroupId)) throw new NotFoundException('Attribute group not found.');
    return this.valueModel.create({...dto,code:dto.code.trim().toUpperCase(),sortOrder:dto.sortOrder||0,active:true} as any);
  }
  async listAttributes(){
    const g=await this.groupModel.findAll({order:[['name','ASC']]});
    const v=await this.valueModel.findAll({order:[['sortOrder','ASC'],['value','ASC']]});
    return g.map(x=>({...x.toJSON(),values:v.filter(y=>y.attributeGroupId===x.id)}));
  }

  async createProduct(dto:CreateProductDto){
    if(!await this.categoryModel.findByPk(dto.categoryId)) throw new NotFoundException('Category not found.');
    if(dto.brandId&&!await this.brandModel.findByPk(dto.brandId)) throw new NotFoundException('Brand not found.');
    return this.productModel.create({...dto,brandId:dto.brandId||null,slug:await this.uniqueSlug(this.productModel,dto.name),status:dto.status||ProductStatus.DRAFT,featured:dto.featured||false} as any);
  }

  async updateProduct(id:string,dto:UpdateProductDto){
    const p=await this.productModel.findByPk(id);
    if(!p) throw new NotFoundException('Product not found.');
    if(dto.categoryId && !await this.categoryModel.findByPk(dto.categoryId)) throw new NotFoundException('Category not found.');
    if(dto.brandId && !await this.brandModel.findByPk(dto.brandId)) throw new NotFoundException('Brand not found.');
    if(dto.name && dto.name!==p.name) p.slug=await this.uniqueSlug(this.productModel,dto.name,p.id);
    Object.assign(p,dto);
    if(dto.brandId==='') p.brandId=null;
    await p.save();
    return p;
  }

  async listProducts(publicOnly=false){
    const products=await this.productModel.findAll({where:publicOnly?{status:ProductStatus.ACTIVE}:undefined,order:[['createdAt','DESC']]});
    const variants=await this.variantModel.findAll();
    const cats=await this.categoryModel.findAll();
    const brands=await this.brandModel.findAll();
    const stocks=await this.inventory.stockSummary();
    return products.map(p=>({...p.toJSON(),category:cats.find(c=>c.id===p.categoryId)||null,brand:brands.find(b=>b.id===p.brandId)||null,variants:variants.filter(v=>v.productId===p.id).map(v=>({...v.toJSON(),stock:stocks.find(s=>s.variantId===v.id)?.available??0,inventory:stocks.find(s=>s.variantId===v.id)||null}))}));
  }

  async getProductBySlug(slug:string){
    const p=await this.productModel.findOne({where:{slug,status:ProductStatus.ACTIVE}});
    if(!p) throw new NotFoundException('Product not found.');
    const all=await this.listProducts(true);
    return all.find((x:any)=>x.id===p.id);
  }

  async createVariant(dto:CreateVariantDto){
    const p=await this.productModel.findByPk(dto.productId); if(!p) throw new NotFoundException('Product not found.');
    if(await this.variantModel.findOne({where:{sku:dto.sku.trim().toUpperCase()}})) throw new ConflictException('SKU already exists.');
    const code=normalizeVariantCode(dto.variantCode);
    const created=await this.sequelize.transaction({isolationLevel:Transaction.ISOLATION_LEVELS.SERIALIZABLE},async t=>{
      const c=await this.categoryModel.findByPk(p.categoryId,{transaction:t,lock:t.LOCK.UPDATE}); if(!c) throw new NotFoundException('Category not found.');
      const serial=c.nextBarcodeSerial; if(serial>9999) throw new BadRequestException('Category exceeded 9,999 barcode serials.');
      const firstTen=`${c.barcodePrefix}${code}${String(serial).padStart(4,'0')}`; const barcode=`${firstTen}${checksum2(firstTen)}`;
      c.nextBarcodeSerial=serial+1; await c.save({transaction:t});
      return this.variantModel.create({productId:dto.productId,sku:dto.sku.trim().toUpperCase(),barcode,variantCode:code,attributes:dto.attributes,price:dto.price,salePrice:dto.salePrice??null,costPrice:dto.costPrice??null,weight:dto.weight??null,imageUrl:dto.imageUrl??null,active:dto.active??true} as any,{transaction:t});
    });
    await this.inventory.ensureVariantStock(created.id,dto.openingStock||0);
    return created;
  }

  async updateVariant(id:string,dto:UpdateVariantDto){
    const v=await this.variantModel.findByPk(id);
    if(!v) throw new NotFoundException('Variant not found.');
    if(dto.sku && dto.sku.toUpperCase()!==v.sku){
      if(await this.variantModel.findOne({where:{sku:dto.sku.toUpperCase()}})) throw new ConflictException('SKU already exists.');
      dto.sku=dto.sku.toUpperCase();
    }
    Object.assign(v,dto);
    await v.save();
    return v;
  }

  async listVariants(){
    const v=await this.variantModel.findAll({order:[['createdAt','DESC']]});
    const s=await this.inventory.stockSummary();
    return v.map(x=>({...x.toJSON(),inventory:s.find(i=>i.variantId===x.id)||null}));
  }

  async setProductStatus(id:string,status:ProductStatus){
    const p=await this.productModel.findByPk(id); if(!p) throw new NotFoundException('Product not found.');
    if(status===ProductStatus.ACTIVE && await this.variantModel.count({where:{productId:id}})===0) throw new BadRequestException('Add at least one variant before activating a product.');
    p.status=status; await p.save(); return p;
  }

  async previewBarcode(productId:string,variantCode:string){
    const p=await this.productModel.findByPk(productId);
    if(!p) throw new NotFoundException('Product not found.');
    const c=await this.categoryModel.findByPk(p.categoryId);
    if(!c) throw new NotFoundException('Category not found.');
    const code=normalizeVariantCode(variantCode);
    const serial=c.nextBarcodeSerial;
    if(serial>9999) throw new BadRequestException('Category exceeded 9,999 barcode serials.');
    const firstTen=`${c.barcodePrefix}${code}${String(serial).padStart(4,'0')}`;
    return {
      barcode:`${firstTen}${checksum2(firstTen)}`,
      categoryPrefix:c.barcodePrefix,
      variantCode:code,
      nextSerial:serial,
      note:'Preview only. The serial is consumed only when the variant is created.'
    };
  }

  async findVariantByBarcode(barcode:string){
    const clean=barcode.replace(/\D/g,'');
    if(clean.length!==12) throw new BadRequestException('Barcode must contain exactly 12 digits.');
    const v=await this.variantModel.findOne({where:{barcode:clean}});
    if(!v) throw new NotFoundException('Barcode not found.');
    const p=await this.productModel.findByPk(v.productId);
    const stock=(await this.inventory.stockSummary()).find(x=>x.variantId===v.id)||null;
    return {...v.toJSON(),product:p?{id:p.id,name:p.name,slug:p.slug}:null,inventory:stock};
  }

  async barcodeLabels(variantIds:string[]){
    const variants=await this.variantModel.findAll({where:{id:variantIds}});
    const products=await this.productModel.findAll();
    const stock=await this.inventory.stockSummary();
    return variants.map(v=>{
      const p=products.find(x=>x.id===v.productId);
      return {
        variantId:v.id,
        productName:p?.name||'Product',
        sku:v.sku,
        barcode:v.barcode,
        attributes:v.attributes,
        price:v.salePrice||v.price,
        stock:stock.find(x=>x.variantId===v.id)?.available??0,
      };
    });
  }

}
