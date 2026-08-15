import {
  Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ChangePasswordDto, ForgotPasswordDto, LogoutDto, RefreshTokenDto,
  ResetPasswordDto, VerifyEmailDto,
} from './dto/security.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private context(req:Request){
    return {ip:req.ip,userAgent:req.headers['user-agent']||null};
  }

  @Post('register')
  register(@Body() dto:RegisterDto,@Req() req:Request){
    return this.authService.register(dto,this.context(req))
  }

  @Post('login')
  login(@Body() dto:LoginDto,@Req() req:Request){
    return this.authService.login(dto,this.context(req))
  }

  @Post('refresh')
  refresh(@Body() dto:RefreshTokenDto,@Req() req:Request){
    return this.authService.refresh(dto,this.context(req))
  }

  @Post('logout')
  logout(@Body() dto:LogoutDto,@CurrentUser() user:any){
    return this.authService.logout(dto.refreshToken,user?.id)
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  sessions(@CurrentUser() user:any){return this.authService.sessions(user.id)}

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  revokeSession(@CurrentUser() user:any,@Param('id') id:string){
    return this.authService.revokeSession(user.id,id)
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  logoutAll(@CurrentUser() user:any){return this.authService.logoutAll(user.id)}

  @Post('forgot-password')
  forgotPassword(@Body() dto:ForgotPasswordDto){return this.authService.forgotPassword(dto)}

  @Post('reset-password')
  resetPassword(@Body() dto:ResetPasswordDto){return this.authService.resetPassword(dto)}

  @Post('verify-email')
  verifyEmail(@Body() dto:VerifyEmailDto){return this.authService.verifyEmail(dto)}

  @Post('request-email-verification')
  @UseGuards(JwtAuthGuard)
  requestVerification(@CurrentUser() user:any){return this.authService.requestVerification(user.id)}

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user:any,@Body() dto:ChangePasswordDto){
    return this.authService.changePassword(user.id,dto)
  }

  @Get('admin/audit-logs')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  auditLogs(@Query('limit') limit?:string){return this.authService.auditLogs(Number(limit||200))}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user:any){return user}
}
