import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async issueToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.createCustomer(dto);
    const accessToken = await this.issueToken(user);

    return {
      message: 'Registration successful.',
      accessToken,
      user: user.toSafeJSON(),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await user.comparePassword(dto.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('This account is inactive.');
    }

    const accessToken = await this.issueToken(user);

    return {
      message: 'Login successful.',
      accessToken,
      user: user.toSafeJSON(),
    };
  }
}
