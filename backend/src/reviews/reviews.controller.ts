import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  ModerateReviewDto,
} from './dto/review.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private s: ReviewsService) {}

  @Get('public/product/:productId')
  publicReviews(@Param('productId') id: string) {
    return this.s.publicForProduct(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  myReviews(@CurrentUser() user: any) {
    return this.s.mine(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.s.create(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  list() {
    return this.s.list();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.s.moderate(id, dto.status);
  }
}
