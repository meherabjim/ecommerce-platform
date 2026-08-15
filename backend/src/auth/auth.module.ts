import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';

import { UsersModule } from '../users/users.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

import { AuthToken } from './models/auth-token.model';
import { AuditLog } from './models/audit-log.model';

import { UserSession } from './models/user-session.model';
import { AuthAuditLog } from './models/auth-audit-log.model';


@Module({

  imports: [

    UsersModule,

    PassportModule,


    SequelizeModule.forFeature([
      AuthToken,
      AuditLog,
      UserSession,
      AuthAuditLog,
    ]),


    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => ({

        secret:
          configService.getOrThrow<string>(
            'JWT_SECRET'
          ),

        signOptions: {
          expiresIn:
            configService.get<string>(
              'JWT_EXPIRES_IN',
              '15m',
            ) as any,
        },

      }),

    }),

  ],


  controllers: [
    AuthController,
  ],


  providers: [
    AuthService,
    AuditService,
    JwtStrategy,
    RolesGuard,
  ],


  exports: [
    JwtModule,
    AuditService,
  ],

})

export class AuthModule {}