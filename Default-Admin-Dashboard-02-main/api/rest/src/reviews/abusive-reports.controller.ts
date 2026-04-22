// reviews/abusive-reports.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { AbusiveReportService } from './abusive-reports.service';
import { GetReportDto } from 'src/reports/dto/get-reports.dto';
import { Report } from 'src/reports/entities/report.entity';
@ApiTags('Abusive Reports')
@Controller('abusive-reports')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is ready
// @ApiBearerAuth('JWT-auth')
export class AbusiveReportsController {
  constructor(private readonly reportService: AbusiveReportService) {}

  @Get()
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Get all abusive reports',
    description: 'Retrieve all abusive reports (Admin only)'
  })
  @ApiOkResponse({
    description: 'Reports retrieved successfully',
    type: [Report]
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiQuery({ name: 'model_id', required: false, type: Number, description: 'Filter by model ID' })
  async findAll(@Query() query: GetReportDto): Promise<Report[]> {
    return this.reportService.findAllReports(query);
  }

  @Get(':id')
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Get abusive report by ID',
    description: 'Retrieve a specific abusive report by ID'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report retrieved successfully',
    type: Report
  })
  @ApiNotFoundResponse({ description: 'Report not found' })
  find(@Param('id', ParseIntPipe) id: number): Promise<Report> {
    return this.reportService.findReport(id);
  }

  @Post()
  // @Roles(Permission.CUSTOMER) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Create an abusive report',
    description: 'Create a new abusive report for a review (Customer only)'
  })
  @ApiCreatedResponse({
    description: 'Report created successfully',
    type: Report
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateReportDto })
  create(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportService.create(createReportDto);
  }

  @Put(':id')
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Update abusive report',
    description: 'Update an existing abusive report by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report updated successfully',
    type: Report
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateReportDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportDto: UpdateReportDto
  ): Promise<Report> {
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Delete abusive report',
    description: 'Permanently delete an abusive report (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.reportService.delete(id);
  }
}