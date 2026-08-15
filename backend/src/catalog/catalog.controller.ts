import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import * as bwipjs from 'bwip-js';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateAttributeGroupDto,CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { BarcodeLabelsDto } from './dto/barcode.dto';
import { ProductStatus } from './models/product.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('catalog')
export class CatalogController {
 constructor(private s:CatalogService){}

 @Get('public/categories') pc(){return this.s.listCategories(true)}
 @Get('public/brands') pb(){return this.s.listBrands(true)}
 @Get('public/products') pp(){return this.s.listProducts(true)}
 @Get('public/products/:slug') pd(@Param('slug') slug:string){return this.s.getProductBySlug(slug)}


 @Post('media/upload')
 @UseGuards(JwtAuthGuard,RolesGuard)
 @Roles(UserRole.ADMIN)
 @UseInterceptors(FileInterceptor('file',{limits:{fileSize:25*1024*1024}}))
 async uploadMedia(@UploadedFile() file:any,@Req() req:Request){
   if(!file) throw new BadRequestException('Choose an image or video file.');
   const allowed=['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];
   if(!allowed.includes(file.mimetype)) throw new BadRequestException('Only JPG, PNG, WEBP, GIF, MP4, WEBM or MOV files are allowed.');
   const folder=join(process.cwd(),'uploads','products');
   await mkdir(folder,{recursive:true});
   const extension=({
     'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif',
     'video/mp4':'.mp4','video/webm':'.webm','video/quicktime':'.mov'
   } as Record<string,string>)[file.mimetype];
   const filename=`${randomUUID()}${extension}`;
   await writeFile(join(folder,filename),file.buffer);
   const origin=`${req.protocol}://${req.get('host')}`;
   return {url:`${origin}/uploads/products/${filename}`,type:file.mimetype.startsWith('video/')?'video':'image'};
 }

 @Get('categories') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) c(){return this.s.listCategories()}
 @Post('categories') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cc(@Body() d:CreateCategoryDto){return this.s.createCategory(d)}
 @Patch('categories/:id') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) uc(@Param('id') id:string,@Body() d:UpdateCategoryDto){return this.s.updateCategory(id,d)}
 @Delete('categories/:id') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) dc(@Param('id') id:string){return this.s.deleteCategory(id)}

 @Get('brands') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) b(){return this.s.listBrands()}
 @Post('brands') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cb(@Body() d:CreateBrandDto){return this.s.createBrand(d)}

 @Get('attributes') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) a(){return this.s.listAttributes()}
 @Post('attributes/groups') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cag(@Body() d:CreateAttributeGroupDto){return this.s.createAttributeGroup(d)}
 @Post('attributes/values') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cav(@Body() d:CreateAttributeValueDto){return this.s.createAttributeValue(d)}

 @Get('products') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) p(){return this.s.listProducts()}
 @Post('products') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cp(@Body() d:CreateProductDto){return this.s.createProduct(d)}
 @Patch('products/:id') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) up(@Param('id') id:string,@Body() d:UpdateProductDto){return this.s.updateProduct(id,d)}
 @Patch('products/:id/status') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) ps(@Param('id') id:string,@Query('status') status:ProductStatus){return this.s.setProductStatus(id,status)}

 @Get('variants') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) v(){return this.s.listVariants()}
 @Post('variants') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cv(@Body() d:CreateVariantDto){return this.s.createVariant(d)}
 @Patch('variants/:id') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) uv(@Param('id') id:string,@Body() d:UpdateVariantDto){return this.s.updateVariant(id,d)}

 @Get('barcodes/preview') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
 previewBarcode(@Query('productId') productId:string,@Query('variantCode') variantCode:string){return this.s.previewBarcode(productId,variantCode)}

 @Get('barcodes/search/:barcode') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
 barcodeSearch(@Param('barcode') barcode:string){return this.s.findVariantByBarcode(barcode)}

 @Post('barcodes/labels') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN)
 barcodeLabels(@Body() dto:BarcodeLabelsDto){return this.s.barcodeLabels(dto.variantIds)}

 @Get('public/barcodes/:barcode/svg')
 async barcodeSvg(@Param('barcode') barcode:string,@Res() res:Response){
   const clean=barcode.replace(/\D/g,'');
   if(clean.length!==12){res.status(400).send('Invalid barcode');return;}
   const svg=bwipjs.toSVG({
     bcid:'code128',
     text:clean,
     scale:3,
     height:12,
     includetext:true,
     textxalign:'center',
     textsize:10,
   });
   res.type('image/svg+xml').send(svg);
 }

}
