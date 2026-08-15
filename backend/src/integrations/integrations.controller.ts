import { Controller, Get, UseGuards } from '@nestjs/common';

import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller()
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get('admin/integrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  status() {
    return this.service.status();
  }
}
