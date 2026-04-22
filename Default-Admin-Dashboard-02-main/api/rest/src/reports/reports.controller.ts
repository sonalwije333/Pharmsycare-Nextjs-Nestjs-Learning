// reports/reports.controller.ts
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
  HttpCode,
  HttpStatus,
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
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportDto, ReportPaginator } from './dto/get-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Create a new report',
    description: 'Creates a new report for abusive content or issues'
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
    return this.reportsService.create(createReportDto);
  }

  @Get()
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Get all reports',
    description: 'Retrieve paginated list of all reports with filtering options'
  })
  @ApiOkResponse({
    description: 'Reports retrieved successfully',
    type: ReportPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in message' })
  @ApiQuery({ name: 'model_type', required: false, type: String, description: 'Filter by model type' })
  @ApiQuery({ name: 'user_id', required: false, type: Number, description: 'Filter by user ID' })
  @ApiQuery({ name: 'model_id', required: false, type: Number, description: 'Filter by model ID' })
  findAll(@Query() query: GetReportDto): Promise<ReportPaginator> {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific report by ID'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report retrieved successfully',
    type: Report
  })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Report> {
    return this.reportsService.findOne(id);
  }

  @Get('user/:userId')
   @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Get reports by user',
    description: 'Retrieve all reports submitted by a specific user'
  })
  @ApiParam({ name: 'userId', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User reports retrieved successfully',
    type: ReportPaginator
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetReportDto
  ): Promise<ReportPaginator> {
    return this.reportsService.findByUser(userId, query);
  }

  @Get('model/:modelType/:modelId')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Get reports by model',
    description: 'Retrieve all reports for a specific model (e.g., all reports for a review)'
  })
  @ApiParam({ name: 'modelType', description: 'Model type', example: 'Marvel\\Database\\Models\\Review' })
  @ApiParam({ name: 'modelId', description: 'Model ID', type: Number })
  @ApiOkResponse({
    description: 'Model reports retrieved successfully',
    type: ReportPaginator
  })
  findByModel(
    @Param('modelType') modelType: string,
    @Param('modelId', ParseIntPipe) modelId: number,
    @Query() query: GetReportDto
  ): Promise<ReportPaginator> {
    return this.reportsService.findByModel(modelType, modelId, query);
  }

  @Put(':id')
 @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Update report',
    description: 'Update an existing report by ID (Admin only)'
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
    return this.reportsService.update(id, updateReportDto);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete report',
    description: 'Permanently delete a report (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiOkResponse({
    description: 'Report deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Report not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.reportsService.remove(id);
  }
}