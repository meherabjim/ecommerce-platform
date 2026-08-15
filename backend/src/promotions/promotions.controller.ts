import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private s:PromotionsService){}
  @Get('public/featured') featured(){return this.s.featured()}
  @Get('public/active') active(){return this.s.active()}
  @Post('preview') @UseGuards(JwtAuthGuard)
  preview(@CurrentUser() user:any,@Body() body:{code:string;subtotal:number}){return this.s.calculate(body.code,Number(body.subtotal||0),user.id)}
  @Get() @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) list(){return this.s.list()}
  @Post() @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) create(@Body() d:CreatePromotionDto){return this.s.create(d)}
  @Patch(':id/toggle') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) toggle(@Param('id') id:string){return this.s.toggle(id)}
}
