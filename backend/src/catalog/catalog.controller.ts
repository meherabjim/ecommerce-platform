import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateAttributeGroupDto,CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
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

 @Get('categories') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) c(){return this.s.listCategories()}
 @Post('categories') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) cc(@Body() d:CreateCategoryDto){return this.s.createCategory(d)}

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
}
