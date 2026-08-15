import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AddressDto, CreateDeliveryAgentDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import { CreateStaffDto, UpdateUserRoleDto } from './dto/staff.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly s: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(){return this.s.findAll()}

  @Post('staff')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createStaff(@CurrentUser() actor:any,@Body() dto:CreateStaffDto){
    return this.s.createStaff(dto,actor.id)
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(@CurrentUser() actor:any,@Param('id') id:string,@Body() dto:UpdateUserRoleDto){
    return this.s.updateRole(id,dto.role,actor.id)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@CurrentUser() actor:any,@Param('id') id:string,@Body() dto:UpdateUserStatusDto){
    return this.s.updateStatus(id,dto.status,actor.id)
  }

  @Get('delivery-agents')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  deliveryAgents(){return this.s.deliveryAgents()}

  @Post('delivery-agents')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  createDeliveryAgent(@CurrentUser() actor:any,@Body() dto:CreateDeliveryAgentDto){
    return this.s.createDeliveryAgent(dto,actor.id)
  }

  @Get('me/addresses') @UseGuards(JwtAuthGuard)
  addresses(@CurrentUser() u:any){return this.s.addresses(u.id)}

  @Post('me/addresses') @UseGuards(JwtAuthGuard)
  createAddress(@CurrentUser() u:any,@Body() dto:AddressDto){return this.s.createAddress(u.id,dto)}

  @Patch('me/addresses/:id') @UseGuards(JwtAuthGuard)
  updateAddress(@CurrentUser() u:any,@Param('id') id:string,@Body() dto:AddressDto){return this.s.updateAddress(u.id,id,dto)}

  @Patch('me/addresses/:id/default') @UseGuards(JwtAuthGuard)
  setDefault(@CurrentUser() u:any,@Param('id') id:string){return this.s.setDefaultAddress(u.id,id)}

  @Delete('me/addresses/:id') @UseGuards(JwtAuthGuard)
  deleteAddress(@CurrentUser() u:any,@Param('id') id:string){return this.s.deleteAddress(u.id,id)}

  @Patch('me/profile') @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user:any,@Body() dto:UpdateProfileDto){
    return this.s.updateProfile(user.id,dto)
  }
}
