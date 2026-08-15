import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';


import { UsersService } from '../users/users.service';


import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
  ChangePasswordDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/security.dto';


import { UserStatus } from '../common/enums/user-status.enum';


import {
  AuthToken,
  AuthTokenType,
} from './models/auth-token.model';


import { UserSession } from './models/user-session.model';
import { AuthAuditLog } from './models/auth-audit-log.model';

import { AuditService } from './audit.service';



@Injectable()
export class AuthService {


constructor(

 private readonly usersService: UsersService,

 private readonly jwtService: JwtService,

 private readonly config: ConfigService,


 @InjectModel(AuthToken)
 private readonly tokenModel: typeof AuthToken,


 @InjectModel(UserSession)
 private readonly sessionModel: typeof UserSession,


 @InjectModel(AuthAuditLog)
 private readonly authAuditModel: typeof AuthAuditLog,


 private readonly audit: AuditService,

){}





private accessToken(user:any){

 return this.jwtService.signAsync({

  sub:user.id,

  email:user.email,

  role:user.role,

 });

}





private hashToken(value:string){

 return createHash('sha256')
 .update(value)
 .digest('hex');

}





private async opaqueToken(

 userId:string,

 type:AuthTokenType,

 ttlMinutes:number,

 context?:{
  ip?:string|null;
  userAgent?:string|null;
 }

){


 const token =
 randomBytes(40).toString('hex');


 const expiresAt =
 new Date(
  Date.now()+ttlMinutes*60_000
 );



 await this.tokenModel.create({

  userId,

  type,

  tokenHash:
  this.hashToken(token),


  expiresAt,


  usedAt:null,


  ipAddress:
  context?.ip || null,


  userAgent:
  context?.userAgent || null,


  lastUsedAt:
  new Date(),


 } as any);



 return token;

}





private async consumeToken(

 value:string,

 type:AuthTokenType

){


 const row =
 await this.tokenModel.findOne({

  where:{

   tokenHash:
   this.hashToken(value),

   type,

  },

 });



 if(
  !row ||
  row.usedAt ||
  new Date(row.expiresAt).getTime()
  <= Date.now()
 ){

  throw new UnauthorizedException(
   'Token is invalid or expired.'
  );

 }



 row.usedAt =
 new Date();


 row.lastUsedAt =
 new Date();


 await row.save();


 return row;

}





private async createSession(

 user:any,

 context?:any

){


 const accessToken =
 await this.accessToken(user);



 const refreshDays =
 Number(
  this.config.get<string>(
   'REFRESH_TOKEN_DAYS',
   '30'
  )
 );



 const refreshToken =
 await this.opaqueToken(

  user.id,

  AuthTokenType.REFRESH,

  refreshDays*24*60,

  context

 );



 await this.sessionModel.create({

  userId:user.id,


  refreshTokenHash:
  this.hashToken(refreshToken),


  ipAddress:
  context?.ip || null,


  userAgent:
  context?.userAgent || null,


  expiresAt:
  new Date(
   Date.now()
   +
   refreshDays*
   24*
   60*
   60*
   1000
  ),


  lastActiveAt:
  new Date(),


  isRevoked:false,


 } as any);



 await this.authAuditModel.create({

  userId:user.id,

  action:
  'LOGIN_SESSION_CREATED',

  ipAddress:
  context?.ip || null,


  userAgent:
  context?.userAgent || null,


 } as any);



 return {

  accessToken,

  refreshToken,

  user:user.toSafeJSON(),

 };

}





// ================= REGISTER =================


async register(

 dto:RegisterDto,

 context?:any

){


 const user =
 await this.usersService.createCustomer(dto);



 const verifyToken =
 await this.opaqueToken(

  user.id,

  AuthTokenType.EMAIL_VERIFY,

  24*60,

  context

 );



 await this.audit.record({

  actorUserId:user.id,

  action:
  'AUTH_REGISTER',

  entityType:
  'USER',

  entityId:
  user.id,

 });



 return {

  message:
  'Registration successful.',


  ...(await this.createSession(
   user,
   context
  )),


  ...(this.config.get('NODE_ENV')!=='production'
  ?
  {
   developmentVerificationToken:
   verifyToken
  }
  :
  {})

 };

}
// ================= LOGIN =================

async login(
 dto:LoginDto,
 context?:any
){

 const user =
 await this.usersService.findByEmail(
  dto.email
 );


 if(
  !user ||
  !(await user.comparePassword(dto.password))
 ){

  await this.audit.record({

   action:
   'AUTH_LOGIN_FAILED',

   entityType:
   'USER',

   metadata:{
    email:
    dto.email
    .trim()
    .toLowerCase()
   },

   ipAddress:
   context?.ip,

   userAgent:
   context?.userAgent,

  });


  throw new UnauthorizedException(
   'Invalid email or password.'
  );

 }



 if(
  user.status !== UserStatus.ACTIVE
 ){

  throw new UnauthorizedException(
   'This account is inactive.'
  );

 }



 user.lastLoginAt =
 new Date();


 await user.save();



 await this.audit.record({

  actorUserId:user.id,

  action:
  'AUTH_LOGIN',

  entityType:
  'USER',

  entityId:
  user.id,


  ipAddress:
  context?.ip,


  userAgent:
  context?.userAgent,

 });



 return {

  message:
  'Login successful.',


  ...(await this.createSession(
   user,
   context
  ))

 };

}





// ================= REFRESH =================


async refresh(
 dto:RefreshTokenDto,
 context?:any
){

 const row =
 await this.consumeToken(
  dto.refreshToken,
  AuthTokenType.REFRESH
 );



 const user =
 await this.usersService.findByIdOrFail(
  row.userId
 );



 if(
  user.status !== UserStatus.ACTIVE
 ){

  throw new UnauthorizedException(
   'Account is not active.'
  );

 }



 return {

  message:
  'Session refreshed.',


  ...(await this.createSession(
   user,
   context
  ))

 };

}





// ================= LOGOUT =================


async logout(
 refreshToken?:string,
 userId?:string
){

 if(refreshToken){


  const hash =
  this.hashToken(refreshToken);



  await this.sessionModel.update(

   {
    isRevoked:true
   },

   {
    where:{
     refreshTokenHash:hash
    }
   }

  );



  const row =
  await this.tokenModel.findOne({

   where:{
    tokenHash:hash,
    type:AuthTokenType.REFRESH
   }

  });



  if(row && !row.usedAt){

   row.usedAt =
   new Date();

   await row.save();

  }

 }



 if(userId){

  await this.audit.record({

   actorUserId:userId,

   action:
   'AUTH_LOGOUT',

   entityType:
   'USER',

   entityId:
   userId

  });

 }



 return {
  loggedOut:true
 };

}





// ================= SESSIONS =================


async sessions(
 userId:string
){

 const rows =
 await this.sessionModel.findAll({

  where:{
   userId,
   isRevoked:false
  },


  order:[
   ['createdAt','DESC']
  ],


  limit:50

 });



 return rows.map(
  x=>({

   id:x.id,

   ipAddress:
   x.ipAddress,


   userAgent:
   x.userAgent,


   createdAt:
   x.createdAt,


   lastActiveAt:
   x.lastActiveAt,


   expiresAt:
   x.expiresAt

  })
 );

}





// ================= REVOKE SESSION =================


async revokeSession(
 userId:string,
 id:string
){

 const row =
 await this.sessionModel.findOne({

  where:{
   id,
   userId
  }

 });



 if(!row){

  throw new NotFoundException(
   'Session not found.'
  );

 }



 row.isRevoked =
 true;


 await row.save();



 await this.audit.record({

  actorUserId:userId,

  action:
  'AUTH_SESSION_REVOKED',

  entityType:
  'USER_SESSION',

  entityId:
  id

 });



 return {
  revoked:true
 };

}





// ================= LOGOUT ALL =================


async logoutAll(
 userId:string
){


 await this.sessionModel.update(

  {
   isRevoked:true
  },


  {
   where:{
    userId,
    isRevoked:false
   }
  }

 );



 await this.audit.record({

  actorUserId:userId,

  action:
  'AUTH_LOGOUT_ALL',

  entityType:
  'USER',

  entityId:
  userId

 });



 return {
  loggedOutAll:true
 };

}

// ================= FORGOT PASSWORD =================

async forgotPassword(
 dto:ForgotPasswordDto
){

 const user =
 await this.usersService.findByEmail(
  dto.email
 );


 let resetToken:string|undefined;



 if(user){

  resetToken =
  await this.opaqueToken(
   user.id,
   AuthTokenType.PASSWORD_RESET,
   30
  );



  await this.audit.record({

   actorUserId:user.id,

   action:
   'AUTH_PASSWORD_RESET_REQUESTED',

   entityType:
   'USER',

   entityId:
   user.id

  });

 }



 return {

  message:
  'If account exists, reset instruction created.',


  ...(this.config.get('NODE_ENV')!=='production'
  && resetToken
  ?
  {
   developmentResetToken:
   resetToken
  }
  :
  {})

 };

}





// ================= RESET PASSWORD =================


async resetPassword(
 dto:ResetPasswordDto
){

 const row =
 await this.consumeToken(
  dto.token,
  AuthTokenType.PASSWORD_RESET
 );



 const user =
 await this.usersService.findByIdOrFail(
  row.userId
 );



 user.passwordHash =
 await bcrypt.hash(
  dto.password,
  12
 );



 user.passwordChangedAt =
 new Date();



 await user.save();



 await this.sessionModel.update(

  {
   isRevoked:true
  },


  {
   where:{
    userId:user.id
   }
  }

 );



 await this.audit.record({

  actorUserId:user.id,

  action:
  'AUTH_PASSWORD_RESET_COMPLETED',

  entityType:
  'USER',

  entityId:
  user.id

 });



 return {

  message:
  'Password changed successfully.'

 };

}





// ================= CHANGE PASSWORD =================


async changePassword(
 userId:string,
 dto:ChangePasswordDto
){

 const user =
 await this.usersService.findByIdOrFail(
  userId
 );



 if(
  !(await user.comparePassword(
    dto.currentPassword
  ))
 ){

  throw new BadRequestException(
   'Current password incorrect.'
  );

 }



 user.passwordHash =
 await bcrypt.hash(
  dto.newPassword,
  12
 );



 user.passwordChangedAt =
 new Date();



 await user.save();



 await this.sessionModel.update(

  {
   isRevoked:true
  },


  {
   where:{
    userId,
    isRevoked:false
   }
  }

 );



 await this.audit.record({

  actorUserId:userId,

  action:
  'AUTH_PASSWORD_CHANGED',

  entityType:
  'USER',

  entityId:
  userId

 });



 return {

  message:
  'Password changed successfully.'

 };

}





// ================= VERIFY EMAIL =================


async verifyEmail(
 dto:VerifyEmailDto
){

 const row =
 await this.consumeToken(
  dto.token,
  AuthTokenType.EMAIL_VERIFY
 );



 const user =
 await this.usersService.findByIdOrFail(
  row.userId
 );



 if(!user.emailVerifiedAt){

  user.emailVerifiedAt =
  new Date();


  await user.save();

 }



 await this.audit.record({

  actorUserId:user.id,

  action:
  'AUTH_EMAIL_VERIFIED',

  entityType:
  'USER',

  entityId:
  user.id

 });



 return {

  message:
  'Email verified successfully.',


  user:
  user.toSafeJSON()

 };

}





// ================= REQUEST VERIFICATION =================


async requestVerification(
 userId:string
){

 const user =
 await this.usersService.findByIdOrFail(
  userId
 );



 if(user.emailVerifiedAt){

  return {
   message:
   'Email already verified.'
  };

 }



 const token =
 await this.opaqueToken(

  user.id,

  AuthTokenType.EMAIL_VERIFY,

  24*60

 );



 return {

  message:
  'Verification token created.',


  ...(this.config.get('NODE_ENV')!=='production'
  ?
  {
   developmentVerificationToken:
   token
  }
  :
  {})

 };

}





// ================= AUDIT LOGS =================


async auditLogs(
 limit:number = 200
){

 return this.audit.list(
  limit
 );

}


}