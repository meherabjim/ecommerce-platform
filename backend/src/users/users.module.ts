import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { User } from './models/user.model';
import { Address } from './models/address.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuditLog } from '../auth/models/audit-log.model';

@Module({
  imports: [SequelizeModule.forFeature([User,Address,AuditLog]), ConfigModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
