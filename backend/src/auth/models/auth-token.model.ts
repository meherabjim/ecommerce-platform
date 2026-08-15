import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

export enum AuthTokenType {
  REFRESH = 'REFRESH',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFY = 'EMAIL_VERIFY',
}

@Table({
  tableName: 'auth_tokens',
  timestamps: true,
  underscored: true,
})
export class AuthToken extends Model<AuthToken> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ field: 'user_id', type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare type: AuthTokenType;

  @Unique
  @Column({ field: 'token_hash', type: DataType.STRING(64), allowNull: false })
  declare tokenHash: string;

  @Column({ field: 'expires_at', type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ field: 'used_at', type: DataType.DATE, allowNull: true })
  declare usedAt: Date | null;

  @Column({ field: 'ip_address', type: DataType.STRING(120), allowNull: true })
  declare ipAddress:string|null;

  @Column({ field: 'user_agent', type: DataType.TEXT, allowNull: true })
  declare userAgent:string|null;

  @Column({ field: 'last_used_at', type: DataType.DATE, allowNull: true })
  declare lastUsedAt:Date|null;
}
