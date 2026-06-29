// reporting/reporting.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportingService, ReportPeriod } from './reporting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';

const VALID_PERIODS: ReportPeriod[] = ['daily', 'weekly', 'monthly'];

function normalizePeriod(value?: string): ReportPeriod {
  return VALID_PERIODS.includes(value as ReportPeriod)
    ? (value as ReportPeriod)
    : 'monthly';
}

@ApiTags('🧾 Reports')
@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('financial')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Financial report (daily/weekly/monthly)' })
  @ApiQuery({ name: 'period', required: false, enum: VALID_PERIODS })
  financial(@Query('period') period?: string) {
    return this.reportingService.financial(normalizePeriod(period));
  }

  @Get('revenue')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Revenue tracking report' })
  @ApiQuery({ name: 'period', required: false, enum: VALID_PERIODS })
  revenue(@Query('period') period?: string) {
    return this.reportingService.revenue(normalizePeriod(period));
  }

  @Get('payments')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Payment processing report' })
  payments() {
    return this.reportingService.payments();
  }

  @Get('salaries')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER)
  @ApiOperation({ summary: 'Employee salary report' })
  salaries() {
    return this.reportingService.salaries();
  }

  @Get('stock')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Stock amount report' })
  stock() {
    return this.reportingService.stock();
  }

  @Get('sales-performance')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({ summary: 'Sales performance report' })
  salesPerformance() {
    return this.reportingService.salesPerformance();
  }
}
