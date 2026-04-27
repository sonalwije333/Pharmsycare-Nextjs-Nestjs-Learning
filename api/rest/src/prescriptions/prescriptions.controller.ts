// prescriptions/prescriptions.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { GetPrescriptionsDto, PrescriptionPaginator } from './dto/get-prescriptions.dto';
import { Prescription } from './entities/prescription.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@ApiTags('💊 Prescriptions')
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload prescription',
    description: 'Customer can upload their prescription for approval',
  })
  @ApiCreatedResponse({
    description: 'Prescription uploaded successfully',
    type: Prescription,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Only customers can upload prescriptions' })
  @ApiBody({ type: CreatePrescriptionDto })
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all prescriptions (Admin/Staff only)',
    description: 'Retrieve paginated list of prescriptions - only accessible to store owner, admin, and staff',
  })
  @ApiOkResponse({
    description: 'Prescriptions retrieved successfully',
    type: PrescriptionPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 15 })
  @ApiQuery({ name: 'search', description: 'Search query', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'shop_id', description: 'Filter by shop ID', required: false })
  async findAll(@Query() query: GetPrescriptionsDto): Promise<PrescriptionPaginator> {
    return this.prescriptionsService.findAll(query);
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get prescriptions by customer ID',
    description: 'Get all prescriptions for a specific customer',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Prescriptions retrieved successfully',
    type: [Prescription],
  })
  @ApiNotFoundResponse({ description: 'No prescriptions found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getCustomerPrescriptions(
    @Param('customerId', ParseIntPipe) customerId: number,
  ): Promise<Prescription[]> {
    return this.prescriptionsService.findByCustomerId(customerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get prescription by ID',
    description: 'Retrieve prescription details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Prescription retrieved successfully',
    type: Prescription,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Prescription> {
    return this.prescriptionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update prescription (Admin/Staff only)',
    description: 'Update prescription status and notes',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Prescription updated successfully',
    type: Prescription,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdatePrescriptionDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Approve prescription (Admin/Staff only)',
    description: 'Approve a prescription for use',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Prescription approved successfully',
    type: Prescription,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        staffId: { type: 'number', example: 1 },
        notes: { type: 'string', example: 'Prescription verified' },
      },
    },
  })
  async approvePrescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('staffId', ParseIntPipe) staffId: number,
    @Body('notes') notes: string,
  ): Promise<Prescription> {
    return this.prescriptionsService.approvePrescription(id, staffId, notes);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reject prescription (Admin/Staff only)',
    description: 'Reject a prescription with reason',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Prescription rejected successfully',
    type: Prescription,
  })
  @ApiNotFoundResponse({ description: 'Prescription not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        staffId: { type: 'number', example: 1 },
        notes: { type: 'string', example: 'Invalid prescription format' },
      },
    },
  })
  async rejectPrescription(
    @Param('id', ParseIntPipe) id: number,
    @Body('staffId', ParseIntPipe) staffId: number,
    @Body('notes') notes: string,
  ): Promise<Prescription> {
    return this.prescriptionsService.rejectPrescription(id, staffId, notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete prescription (Admin/Staff only)',
    description: 'Delete a prescription',
  })
  @ApiParam({
    name: 'id',
    description: 'Prescription ID',
    type: Number,
    example: 1,
  })
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
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    return this.prescriptionsService.remove(id);
  }
}
