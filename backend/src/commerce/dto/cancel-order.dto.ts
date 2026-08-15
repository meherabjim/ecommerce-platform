import { IsOptional, IsString, Length } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @Length(3, 300)
  reason: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  note?: string;
}
