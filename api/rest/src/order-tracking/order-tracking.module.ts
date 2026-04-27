// order-tracking/order-tracking.controller.ts
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
import { OrderTrackingService } from './order-tracking.service';
import { CreateOrderTrackingDto } from './dto/create-order-tracking.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { GetOrderTrackingDto, OrderTrackingPaginator } from './dto/get-order-tracking.dto';
import { OrderTracking } from './entities/order-tracking.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';

@ApiTags('📦 Order Tracking')
@Controller('order-tracking')
export class OrderTrackingController {
  constructor(private readonly orderTrackingService: OrderTrackingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create order tracking (Admin/Staff only)',
    description: 'Create a new tracking record for an order',
  })
  @ApiCreatedResponse({
    description: 'Order tracking created successfully',
    type: OrderTracking,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateOrderTrackingDto })
  async create(@Body() createOrderTrackingDto: CreateOrderTrackingDto): Promise<OrderTracking> {
    return this.orderTrackingService.create(createOrderTrackingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all order trackings (Admin/Staff only)',
    description: 'Retrieve paginated list of order trackings',
  })
  @ApiOkResponse({
    description: 'Order trackings retrieved successfully',
    type: OrderTrackingPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, example: 15 })
  @ApiQuery({ name: 'order_id', description: 'Filter by order ID', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'search', description: 'Search query', required: false })
  async findAll(@Query() query: GetOrderTrackingDto): Promise<OrderTrackingPaginator> {
    return this.orderTrackingService.findAll(query);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get tracking by order ID',
    description: 'Retrieve tracking information for a specific order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order tracking retrieved successfully',
    type: OrderTracking,
  })
  @ApiNotFoundResponse({ description: 'Tracking not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderTracking> {
    return this.orderTrackingService.findByOrderId(orderId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF, Permission.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get order tracking by ID',
    description: 'Retrieve tracking details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tracking ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order tracking retrieved successfully',
    type: OrderTracking,
  })
  @ApiNotFoundResponse({ description: 'Tracking not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderTracking> {
    return this.orderTrackingService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update order tracking (Admin/Staff only)',
    description: 'Update tracking status and details',
  })
  @ApiParam({
    name: 'id',
    description: 'Tracking ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order tracking updated successfully',
    type: OrderTracking,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Tracking not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateOrderTrackingDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderTrackingDto: UpdateOrderTrackingDto,
  ): Promise<OrderTracking> {
    return this.orderTrackingService.update(id, updateOrderTrackingDto);
  }

  @Post(':id/update-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update tracking status (Admin/Staff only)',
    description: 'Update the current status of order tracking',
  })
  @ApiParam({
    name: 'id',
    description: 'Tracking ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Tracking status updated successfully',
    type: OrderTracking,
  })
  @ApiNotFoundResponse({ description: 'Tracking not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'in-transit' },
        staffId: { type: 'number', example: 1 },
        notes: { type: 'string', example: 'Package in transit' },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('staffId', ParseIntPipe) staffId: number,
    @Body('notes') notes?: string,
  ): Promise<OrderTracking> {
    return this.orderTrackingService.updateStatus(id, status as any, staffId, notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete order tracking (Admin/Staff only)',
    description: 'Delete an order tracking record',
  })
  @ApiParam({
    name: 'id',
    description: 'Tracking ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order tracking deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tracking not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    return this.orderTrackingService.remove(id);
  }
}
