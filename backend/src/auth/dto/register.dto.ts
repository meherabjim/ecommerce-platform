import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+0-9][0-9\-\s]{7,20}$/)
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;
}
