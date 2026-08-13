import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './models/user.model';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  async ensureAdminUser() {
    const email = this.configService
      .get<string>('ADMIN_EMAIL', 'admin@neurocommerce.local')
      .trim()
      .toLowerCase();
    const password = this.configService.get<string>('ADMIN_PASSWORD', 'Admin12345!');
    const name = this.configService.get<string>('ADMIN_NAME', 'Super Admin');

    const existing = await this.userModel.findOne({ where: { email } });
    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    await this.userModel.create({
      name,
      email,
      phone: null,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    } as any);

    console.log(`Seeded admin user: ${email}`);
  }

  async createCustomer(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return this.userModel.create({
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() || null,
      passwordHash,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    } as any);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findById(id: string) {
    return this.userModel.findByPk(id);
  }

  async findByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async findAll() {
    const users = await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return users.map((user) => user.toSafeJSON());
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.findByIdOrFail(id);

    if (user.role === UserRole.ADMIN && status === UserStatus.INACTIVE) {
      throw new ConflictException('Admin account cannot be disabled from this endpoint.');
    }

    user.status = status;
    await user.save();

    return user.toSafeJSON();
  }
}
