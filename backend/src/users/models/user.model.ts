import {
  BeforeCreate,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare name: string;

  @Unique
  @Column({ type: DataType.STRING(180), allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare phone: string | null;

  @Column({
    field: 'password_hash',
    type: DataType.STRING,
    allowNull: false,
  })
  declare passwordHash: string;

  @Default(UserRole.CUSTOMER)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  declare role: UserRole;

  @Default(UserStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    allowNull: false,
  })
  declare status: UserStatus;

  @Column({
    field: 'email_verified_at',
    type: DataType.DATE,
    allowNull: true,
  })
  declare emailVerifiedAt: Date | null;

  @Column({
    field: 'last_login_at',
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: Date | null;

  @Column({
    field: 'password_changed_at',
    type: DataType.DATE,
    allowNull: true,
  })
  declare passwordChangedAt: Date | null;

  @BeforeCreate
  static async normalizeEmail(user: User) {
    user.email = user.email.trim().toLowerCase();
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      status: this.status,
      emailVerified: Boolean(this.emailVerifiedAt),
      emailVerifiedAt: this.emailVerifiedAt,
      lastLoginAt: this.lastLoginAt,
      passwordChangedAt: this.passwordChangedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
