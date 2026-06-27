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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionsDto } from './dto/get-prescriptions.dto';
import {
  PrescriptionResponseDto,
  PrescriptionPaginatorDto,
} from './dto/prescription-response.dto';
import {
  ApprovePrescriptionDto,
} from './dto/approve-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { RejectPrescriptionDto } from './dto/reject-prescription.dto';
import { PrescriptionStatus } from './prescription.entity';
import { PrescriptionHistoryResponseDto } from './dto/prescription-history-response.dto';

@ApiTags('💊 Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(
    Permission.CUSTOMER,
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  )
  @ApiOperation({
    summary: 'Upload a prescription',
    description: 'Customer uploads a prescription image',
  })
  @ApiCreatedResponse({
    description: 'Prescription uploaded successfully',
    type: PrescriptionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreatePrescriptionDto })
  async create(
    @Req() req: any,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.create(req.user, createPrescriptionDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({
    summary: 'Get all prescriptions',
    description: 'Retrieve paginated list of prescriptions (Admin/Store/Staff only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PrescriptionStatus,
    description: 'Filter by prescription status',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by customer name or email' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiOkResponse({
    description: 'Prescriptions retrieved successfully',
    type: PrescriptionPaginatorDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async findAll(
    @Req() req: any,
    @Query() query: GetPrescriptionsDto,
  ): Promise<PrescriptionPaginatorDto> {
    return this.prescriptionsService.findAll(query, req.user);
  }

  @Get('my')
  @Roles(Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get my prescriptions',
    description: 'Customer retrieves their own prescriptions',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PrescriptionStatus,
    description: 'Filter by prescription status',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by customer name or email' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiOkResponse({
    description: 'Prescriptions retrieved successfully',
    type: PrescriptionPaginatorDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getMyPrescriptions(
    @Req() req: any,
    @Query() query: GetPrescriptionsDto,
  ): Promise<PrescriptionPaginatorDto> {
    return this.prescriptionsService.getMyPrescriptions(req.user.id, query);
  }

  @Get('stats')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get prescription statistics',
    description: 'Get counts of prescriptions by status',
  })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        pending: { type: 'number' },
        approved: { type: 'number' },
        rejected: { type: 'number' },
        fulfilled: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  async getStats(@Req() req: any): Promise<any> {
    return this.prescriptionsService.getStats(req.user);
  }

  @Get(':id/history')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get prescription status history',
    description: 'Retrieve chronological status change history for a prescription',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'History retrieved successfully',
    type: [PrescriptionHistoryResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getHistory(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PrescriptionHistoryResponseDto[]> {
    return this.prescriptionsService.getHistory(id, req.user);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get prescription by ID',
    description: 'Retrieve a specific prescription by ID',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'Prescription retrieved successfully',
    type: PrescriptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.findOne(id, req.user);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @ApiOperation({
    summary: 'Update prescription',
    description: 'Update prescription information by ID (Admin/Store/Staff only)',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'Prescription updated successfully',
    type: PrescriptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdatePrescriptionDto })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.update(id, updatePrescriptionDto, req.user);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete prescription',
    description: 'Permanently delete a prescription (Super Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'Prescription deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async remove(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.prescriptionsService.remove(id, req.user);
  }

  @Post(':id/approve')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve prescription',
    description: 'Approve a pending prescription (Admin/Store/Staff only)',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'Prescription approved successfully',
    type: PrescriptionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Prescription not in pending status' })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: ApprovePrescriptionDto })
  async approve(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApprovePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.approve(id, req.user, approveDto);
  }

  @Post(':id/reject')
  @Roles(Permission.SUPER_ADMIN, Permission.BRANCH_OWNER, Permission.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject prescription',
    description: 'Reject a pending prescription (Admin/Store/Staff only)',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiOkResponse({
    description: 'Prescription rejected successfully',
    type: PrescriptionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Prescription not in pending status' })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: RejectPrescriptionDto })
  async reject(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectPrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.reject(id, req.user, rejectDto);
  }

  @Post(':id/assign-shop')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign prescription to shop',
    description: 'Assign a prescription to a specific shop (Super Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Prescription ID', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shopId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiOkResponse({
    description: 'Prescription assigned successfully',
    type: PrescriptionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async assignToShop(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('shopId', ParseIntPipe) shopId: number,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.assignToShop(id, shopId, req.user);
  }
}