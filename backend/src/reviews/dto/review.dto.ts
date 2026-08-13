import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewStatus } from '../models/review.model';

export class CreateReviewDto {
  @IsString()
  variantId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class ModerateReviewDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;
}
