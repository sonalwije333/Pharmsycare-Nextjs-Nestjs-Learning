// orders/orders.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
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
import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
import { GetOrderStatusesDto, OrderStatusPaginator } from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutVerificationDto, VerifiedCheckoutData } from './dto/verify-checkout.dto';
import { Order, OrderFiles } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from "src/common/enums/enums";
import { OrderStatus } from './entities/order-status.entity';

@ApiTags('📦 Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Create order',
    description: 'Create a new order'
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: Order
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieve paginated list of orders'
  })
  @ApiOkResponse({
    description: 'Orders retrieved successfully',
    type: OrderPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
    return this.ordersService.getOrders(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieve order details by ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: Number,
    example: 48
  })
  @ApiOkResponse({
    description: 'Order retrieved successfully',
    type: Order
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderByIdOrTrackingNumber(id);
  }

  @Get('tracking-number/:tracking_id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get order by tracking number',
    description: 'Retrieve order details by tracking number'
  })
  @ApiParam({
    name: 'tracking_id',
    description: 'Tracking number',
    type: Number,
    example: 20240207303639
  })
  @ApiOkResponse({
    description: 'Order retrieved successfully',
    type: Order
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getOrderByTrackingNumber(@Param('tracking_id', ParseIntPipe) tracking_id: number) {
    return this.ordersService.getOrderByIdOrTrackingNumber(tracking_id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update order',
    description: 'Update order by ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: Number,
    example: 48
  })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: Order
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateOrderDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete order',
    description: 'Delete order by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    type: Number,
    example: 48
  })
  @ApiOkResponse({
    description: 'Order deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }

  @Post('checkout/verify')
  @Roles(Permission.CUSTOMER)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify checkout',
    description: 'Verify checkout data before payment'
  })
  @ApiOkResponse({
    description: 'Checkout verified successfully',
    type: VerifiedCheckoutData
  })
  @ApiBadRequestResponse({ description: 'Invalid checkout data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  verifyCheckout(@Query() query: CheckoutVerificationDto) {
    return this.ordersService.verifyCheckout(query);
  }

  @Post('/payment')
  @Roles(Permission.CUSTOMER)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Submit payment',
    description: 'Submit payment for order'
  })
  @ApiOkResponse({
    description: 'Payment submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Payment processed successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid payment data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: OrderPaymentDto })
  async submitPayment(@Body() orderPaymentDto: OrderPaymentDto): Promise<void> {
    const { tracking_number } = orderPaymentDto;
    const order: Order = await this.ordersService.getOrderByIdOrTrackingNumber(tracking_number);
    switch (order.payment_gateway.toString().toLowerCase()) {
      case 'stripe':
        this.ordersService.stripePay(order);
        break;
      case 'paypal':
        this.ordersService.paypalPay(order);
        break;
      default:
        break;
    }
    this.ordersService.processChildrenOrder(order);
  }
}

@ApiTags('📋 Order Status')
@Controller('order-status')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrderStatusController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create order status',
    description: 'Create a new order status (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Order status created successfully',
    type: OrderStatus
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateOrderStatusDto })
  create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get all order statuses',
    description: 'Retrieve paginated list of order statuses'
  })
  @ApiOkResponse({
    description: 'Order statuses retrieved successfully',
    type: OrderStatusPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetOrderStatusesDto) {
    return this.ordersService.getOrderStatuses(query);
  }

  @Get(':param')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get order status by slug',
    description: 'Retrieve order status details by slug'
  })
  @ApiParam({
    name: 'param',
    description: 'Order status slug',
    example: 'order-received'
  })
  @ApiOkResponse({
    description: 'Order status retrieved successfully',
    type: OrderStatus
  })
  @ApiNotFoundResponse({ description: 'Order status not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('param') param: string, @Query('language') language: string) {
    return this.ordersService.getOrderStatus(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update order status',
    description: 'Update order status by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Order status ID',
    type: Number,
    example: 1
  })
  @ApiOkResponse({
    description: 'Order status updated successfully',
    type: OrderStatus
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Order status not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateOrderStatusDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete order status',
    description: 'Delete order status by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Order status ID',
    type: Number,
    example: 1
  })
  @ApiOkResponse({
    description: 'Order status deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Order status not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}

@ApiTags('📥 Downloads')
@Controller('downloads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrderFilesController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get order files',
    description: 'Retrieve paginated list of downloadable order files'
  })
  @ApiOkResponse({
    description: 'Order files retrieved successfully',
    type: OrderFilesPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getOrderFileItems(@Query() query: GetOrderFilesDto): Promise<OrderFilesPaginator> {
    return this.ordersService.getOrderFileItems(query);
  }

  @Post('digital_file')
  @Roles(Permission.SUPER_ADMIN, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Get digital file download URL',
    description: 'Get download URL for digital file'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        digital_file_id: { type: 'number', example: 76 }
      }
    }
  })
  @ApiOkResponse({
    description: 'Download URL retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/file.pdf' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Digital file not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getDigitalFileDownloadUrl(@Body('digital_file_id', ParseIntPipe) digitalFileId: number) {
    return this.ordersService.getDigitalFileDownloadUrl(digitalFileId);
  }
}

@ApiTags('📤 Order Export')
@Controller('export-order-url')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrderExportController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Export orders',
    description: 'Get export URL for orders (Admin/Store owner only)'
  })
  @ApiQuery({
    name: 'shop_id',
    description: 'Shop ID',
    type: String,
    required: false
  })
  @ApiOkResponse({
    description: 'Export URL retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/orders.xlsx' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async orderExport(@Query('shop_id') shop_id: string) {
    return this.ordersService.exportOrder(shop_id);
  }
}

@ApiTags('📄 Invoice')
@Controller('download-invoice-url')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DownloadInvoiceController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Download invoice',
    description: 'Get download URL for order invoice'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shop_id: { type: 'string', example: '1' }
      }
    }
  })
  @ApiOkResponse({
    description: 'Invoice URL retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/invoice.pdf' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async downloadInvoiceUrl(@Body('shop_id') shop_id: string) {
    return this.ordersService.downloadInvoiceUrl(shop_id);
  }
}