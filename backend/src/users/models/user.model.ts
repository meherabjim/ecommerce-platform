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

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
  })
  declare name: string;

  @Unique
  @Column({
    type: DataType.STRING(180),
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: true,
  })
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
