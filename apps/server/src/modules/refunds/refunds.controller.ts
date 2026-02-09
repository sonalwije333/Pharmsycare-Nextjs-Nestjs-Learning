import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Request } from 'express';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RefundsService} from "./refunds.service";
import {Refund} from "./entities/refund.entity";
import {CreateRefundDto} from "./dto/create-refund.dto";
import {GetRefundsDto, RefundPaginator} from "./dto/get-refunds.dto";
import {UpdateRefundDto} from "./dto/update-refund.dto";
import {UpdateRefundStatusDto} from "./dto/update-refund-status.dto";
import { PermissionType } from '../../common/enums/PermissionType.enum';
import { RefundStatus } from '../../common/enums/enums';

@ApiTags('Refunds')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @Roles(PermissionType.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create refund request', description: 'Creates a new refund request' })
  @ApiResponse({ status: 201, description: 'Refund request created successfully', type: Refund })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(
    @Req() req: Request,
    @Body() createRefundDto: CreateRefundDto,
  ): Promise<Refund> {
    const customerId = (req.user as any).id;
    return this.refundsService.create(createRefundDto, customerId);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get all refunds', description: 'Retrieves a list of all refunds with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus, description: 'Status filter' })
  @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Shop ID filter' })
  @ApiQuery({ name: 'customer_id', required: false, type: Number, description: 'Customer ID filter' })
  @ApiQuery({ name: 'order_id', required: false, type: Number, description: 'Order ID filter' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully', type: RefundPaginator })
  async findAll(@Query() query: GetRefundsDto): Promise<RefundPaginator> {
    return this.refundsService.findAll(query);
  }

  @Get('my-refunds')
  @Roles(PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get my refunds', description: 'Retrieves refund requests for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'status', required: false, enum: RefundStatus, description: 'Status filter' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully', type: RefundPaginator })
  async findMyRefunds(
    @Req() req: Request,
    @Query() query: GetRefundsDto,
  ): Promise<RefundPaginator> {
    const customerId = (req.user as any).id;
    return this.refundsService.findMyRefunds(customerId, query);
  }

  @Get('stats')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get refund statistics', description: 'Retrieves refund statistics' })
  @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Shop ID filter' })
  @ApiResponse({ status: 200, description: 'Refund statistics retrieved successfully' })
  async getStats(@Query('shop_id') shopId?: number): Promise<any> {
    return this.refundsService.getRefundStats(shopId);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get refund by ID', description: 'Retrieves a specific refund by its ID' })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiResponse({ status: 200, description: 'Refund retrieved successfully', type: Refund })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Refund> {
    return this.refundsService.findOne(id);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Update refund', description: 'Updates an existing refund request' })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiResponse({ status: 200, description: 'Refund updated successfully', type: Refund })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRefundDto: UpdateRefundDto,
  ): Promise<Refund> {
    const user = req.user as any;
    const customerId = user.role === PermissionType.CUSTOMER ? user.id : undefined;
    return this.refundsService.update(id, updateRefundDto, customerId);
  }

  @Put(':id/status')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Update refund status', description: 'Updates the status of a refund request' })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiResponse({ status: 200, description: 'Refund status updated successfully', type: Refund })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRefundStatusDto: UpdateRefundStatusDto,
  ): Promise<Refund> {
    return this.refundsService.updateStatus(id, updateRefundStatusDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete refund', description: 'Permanently deletes a refund request' })
  @ApiParam({ name: 'id', description: 'Refund ID', type: Number })
  @ApiResponse({ status: 204, description: 'Refund deleted successfully' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.refundsService.remove(id);
  }
}