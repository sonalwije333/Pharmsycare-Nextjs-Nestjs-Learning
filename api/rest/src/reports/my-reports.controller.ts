// reports/my-reports.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GetMyReportsDto, ReportPaginator } from './dto/get-my-reports.dto';
import { Report } from './entities/report.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('My Reports')
@Controller('my-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MyReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my reports',
    description: 'Retrieve paginated list of reports submitted by the authenticated user'
  })
  @ApiOkResponse({
    description: 'My reports retrieved successfully',
    type: ReportPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findAll(@Request() req: any, @Query() query: GetMyReportsDto): Promise<ReportPaginator> {
    const user = req?.user;
    return this.reportsService.findByUser(user?.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get my report by ID',
    description: 'Retrieve a specific report submitted by the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report retrieved successfully',
    type: Report
  })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Report> {
    const user = req?.user;
    return this.reportsService.findMyReport(id, user?.id);
  }
}
