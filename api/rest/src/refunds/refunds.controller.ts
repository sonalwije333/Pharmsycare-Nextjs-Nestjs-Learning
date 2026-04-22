// refunds/refunds.controller.ts
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
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { GetRefundDto, RefundPaginator } from './dto/get-refunds.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund, RefundStatus } from './entities/refund.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';

@ApiTags('Refunds')
@Controller('refunds')
 @UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Create a new refund request',
    description: 'Creates a new refund request (Customer/Admin/Store owner)'
  })
  @ApiCreatedResponse({
    description: 'Refund created successfully',
    type: Refund
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateRefundDto })
  create(@Body() createRefundDto: CreateRefundDto): Promise<Refund> {
    return this.refundsService.create(createRefundDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Get all refunds',
    description: 'Retrieve paginated list of all refunds with filtering options'
  })
  @ApiOkResponse({
    description: 'Refunds retrieved successfully',
    type: RefundPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'customer_id', required: false, type: Number, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'order_id', required: false, type: Number, description: 'Filter by order ID' })
  findAll(@Query() query: GetRefundDto): Promise<RefundPaginator> {
    return this.refundsService.findAll(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER) 
  @ApiOperation({
    summary: 'Get refund by ID',
    description: 'Retrieve a specific refund by ID'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund retrieved successfully',
    type: Refund
  })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return this.refundsService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Update refund',
    description: 'Update an existing refund by ID (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund updated successfully',
    type: Refund
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateRefundDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRefundDto: UpdateRefundDto,
  ): Promise<Refund> {
    return this.refundsService.update(id, updateRefundDto);
  }

  @Put(':id/approve')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve refund',
    description: 'Approve a refund request (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund approved successfully',
    type: Refund
  })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  approve(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return this.refundsService.approve(id);
  }

  @Put(':id/reject')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject refund',
    description: 'Reject a refund request (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund rejected successfully',
    type: Refund
  })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  reject(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return this.refundsService.reject(id);
  }

  @Put(':id/process')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process refund',
    description: 'Mark refund as processing (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund marked as processing successfully',
    type: Refund
  })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  process(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return this.refundsService.process(id);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete refund',
    description: 'Permanently delete a refund (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiOkResponse({
    description: 'Refund deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.refundsService.remove(id);
  }
}