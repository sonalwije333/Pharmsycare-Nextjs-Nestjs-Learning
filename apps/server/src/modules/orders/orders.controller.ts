import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto/create-order-status.dto';
import { GetOrderStatusesDto, OrderStatusPaginator } from './dto/get-order-statuses.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { OrderStatus } from './entities/order-status.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieves a list of orders with filtering and pagination.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'customer_id', required: false, type: Number, description: 'Customer ID filter' })
  @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
  @ApiQuery({ name: 'tracking_number', required: false, type: String, description: 'Tracking number filter' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'TOTAL', 'TRACKING_NUMBER'], description: 'Order by column' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: OrderPaginator
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
    return this.ordersService.getOrders(query);
  }

  @Get('stats')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({
    summary: 'Get order statistics',
    description: 'Retrieves order statistics and metrics.'
  })
  @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order statistics retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async getOrderStats(@Query('shop_id') shop_id?: string) {
    return this.ordersService.getOrderStats(shop_id);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({
    summary: 'Get order by ID or tracking number',
    description: 'Retrieves a specific order by its ID or tracking number.'
  })
  @ApiParam({ name: 'id', description: 'Order ID or tracking number', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
    type: Order
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async getOrderById(@Param('id') id: string): Promise<Order> {
    // Try to parse as number first, then use as string
    const identifier = isNaN(Number(id)) ? id : Number(id);
    return this.ordersService.getOrderByIdOrTrackingNumber(identifier);
  }
}

@ApiTags('Order Status')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/order-status')
export class OrderStatusController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order status',
    description: 'Creates a new order status. Requires appropriate permissions.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order status successfully created',
    type: OrderStatus
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async create(@Body() createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({
    summary: 'Get all order statuses',
    description: 'Retrieves a list of order statuses with filtering and pagination.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'SERIAL'], description: 'Order by column' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order statuses retrieved successfully',
    type: OrderStatusPaginator
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async findAll(@Query() query: GetOrderStatusesDto): Promise<OrderStatusPaginator> {
    return this.ordersService.getOrderStatuses(query);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({
    summary: 'Get order status by ID',
    description: 'Retrieves a specific order status by its ID.'
  })
  @ApiParam({ name: 'id', description: 'Order status ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status retrieved successfully',
    type: OrderStatus
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order status not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderStatus> {
    return this.ordersService.getOrderStatusById(id);
  }

  @Get('slug/:slug')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({
    summary: 'Get order status by slug',
    description: 'Retrieves a specific order status by its slug.'
  })
  @ApiParam({ name: 'slug', description: 'Order status slug', type: String })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status retrieved successfully',
    type: OrderStatus
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order status not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('language') language?: string,
  ): Promise<OrderStatus> {
    return this.ordersService.getOrderStatusBySlug(slug, language);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({
    summary: 'Update order status',
    description: 'Updates an existing order status.'
  })
  @ApiParam({ name: 'id', description: 'Order status ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated successfully',
    type: OrderStatus
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - invalid input data'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order status not found'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderStatus> {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete order status',
    description: 'Permanently deletes an order status. Requires admin privileges.'
  })
  @ApiParam({ name: 'id', description: 'Order status ID', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Order status deleted successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order status not found'
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions'
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.deleteOrderStatus(id);
  }
}