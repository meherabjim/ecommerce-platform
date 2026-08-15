import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
} from 'sequelize-typescript';

import { User } from '../../users/models/user.model';


@Table({
  tableName: 'user_sessions',
  timestamps: true,
})
export class UserSession extends Model {

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;


  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  declare userId: string;


  @Column({
    type: DataType.TEXT,
    field: 'refresh_token_hash',
  })
  declare refreshTokenHash: string;


  @Column({
    type: DataType.STRING,
    field: 'device_name',
    allowNull: true,
  })
  declare deviceName: string;


  @Column({
    type: DataType.STRING,
    field: 'ip_address',
    allowNull: true,
  })
  declare ipAddress: string;


  @Column({
    type: DataType.TEXT,
    field: 'user_agent',
    allowNull: true,
  })
  declare userAgent: string;


  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    field: 'last_active_at',
  })
  declare lastActiveAt: Date;


  @Column({
    type: DataType.DATE,
    field: 'expires_at',
  })
  declare expiresAt: Date;


  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_revoked',
  })
  declare isRevoked: boolean;

}