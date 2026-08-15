import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { OpsService } from './ops.service';
import { InvoiceService } from './invoice.service';
import { CustomerReportService } from './customer-report.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller()
export class OpsController {
  constructor(private readonly service: OpsService, private readonly invoices:InvoiceService, private readonly customers:CustomerReportService) {}

  @Get('ops/health')
  health() {
    return this.service.health();
  }

  @Get('admin/reports/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  overview() {
    return this.service.overview();
  }

  @Get('admin/reports/orders.csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async ordersCsv(@Res() res: Response) {
    const csv = await this.service.ordersCsv();
    const stamp = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="neuro-commerce-orders-${stamp}.csv"`,
    );
    res.send(csv);
  }

  @Get('ops/invoices/:id')
  @UseGuards(JwtAuthGuard)
  invoice(@CurrentUser() user:any,@Param('id') id:string){return this.invoices.invoice(id,user.id,false)}

  @Get('admin/invoices/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  adminInvoice(@Param('id') id:string){return this.invoices.invoice(id,undefined,true)}

  @Get('ops/admin/customers')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  customersList(){return this.customers.list()}

  @Get('admin/reports/customers.csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async customersCsv(@Res() res:Response){
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="neuro-commerce-customers.csv"');
    res.send(await this.service.customersCsv());
  }

  @Get('admin/reports/inventory.csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async inventoryCsv(@Res() res:Response){
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="neuro-commerce-inventory.csv"');
    res.send(await this.service.inventoryCsv());
  }

}
