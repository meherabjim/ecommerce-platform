import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;

export class RefreshTokenDto {
  @IsString()
  @Length(20, 300)
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(20, 300)
  token!: string;

  @IsString()
  @Matches(strongPassword, {
    message:
      'Password must contain uppercase, lowercase and number and be at least 8 characters.',
  })
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @Matches(strongPassword, {
    message:
      'Password must contain uppercase, lowercase and number and be at least 8 characters.',
  })
  newPassword!: string;
}

export class VerifyEmailDto {
  @IsString()
  @Length(20, 300)
  token!: string;
}
