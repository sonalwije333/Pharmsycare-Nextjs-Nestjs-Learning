import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { Order } from './entities/order.entity';
import {
  CheckoutVerificationDto,
  VerifiedCheckoutData,
} from './dto/verify-checkout.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import {
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from './dto/create-order-status.dto';
import {
  GetOrderStatusesDto,
  OrderStatusPaginator,
} from './dto/get-order-statuses.dto';
import { OrderStatus } from './entities/order-status.entity';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customer_id', required: false, type: Number })
  @ApiQuery({ name: 'shop_id', required: false, type: String })
  @ApiQuery({ name: 'tracking_number', required: false, type: String })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['CREATED_AT', 'UPDATED_AT', 'TOTAL', 'TRACKING_NUMBER'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderPaginator,
  })
  async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
    return this.ordersService.getOrders(query);
  }

  @Get('tracking-number/:tracking_id')
  @ApiOperation({ summary: 'Get order by tracking number' })
  @ApiParam({
    name: 'tracking_id',
    description: 'Tracking number',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderByTrackingNumber(
    @Param('tracking_id') tracking_id: string,
  ): Promise<Order> {
    return this.ordersService.getOrderByTrackingNumber(tracking_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }

  @Post('checkout/verify')
  @ApiOperation({ summary: 'Verify checkout' })
  @ApiResponse({
    status: 200,
    description: 'Checkout verified successfully',
    type: VerifiedCheckoutData,
  })
  async verifyCheckout(
    @Body() verificationDto: CheckoutVerificationDto,
  ): Promise<VerifiedCheckoutData> {
    return this.ordersService.verifyCheckout(verificationDto);
  }

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async submitPayment(@Body() orderPaymentDto: OrderPaymentDto): Promise<void> {
    return this.ordersService.submitPayment(orderPaymentDto);
  }
}

@ApiTags('Order Status')
@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order status' })
  @ApiResponse({
    status: 201,
    description: 'Order status successfully created',
    type: OrderStatus,
  })
  async create(
    @Body() createOrderStatusDto: CreateOrderStatusDto,
  ): Promise<OrderStatus> {
    return this.ordersService.createOrderStatus(createOrderStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all order statuses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'SERIAL'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Order statuses retrieved successfully',
    type: OrderStatusPaginator,
  })
  async findAll(
    @Query() query: GetOrderStatusesDto,
  ): Promise<OrderStatusPaginator> {
    return this.ordersService.getOrderStatuses(query);
  }

  @Get(':param')
  @ApiOperation({ summary: 'Get order status by ID or slug' })
  @ApiParam({
    name: 'param',
    description: 'Order status ID or slug',
    type: String,
  })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Order status retrieved successfully',
    type: OrderStatus,
  })
  @ApiResponse({ status: 404, description: 'Order status not found' })
  async findOne(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<OrderStatus> {
    const id = parseInt(param, 10);
    if (!isNaN(id)) {
      return this.ordersService.getOrderStatusById(id);
    }
    return this.ordersService.getOrderStatusBySlug(param, language);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order status ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderStatus,
  })
  @ApiResponse({ status: 404, description: 'Order status not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderStatus> {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order status' })
  @ApiParam({ name: 'id', description: 'Order status ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Order status deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Order status not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.deleteOrderStatus(id);
  }
}

@ApiTags('Order Downloads')
@Controller('downloads')
export class OrderFilesController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get order files' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Order files retrieved successfully',
    type: OrderFilesPaginator,
  })
  async getOrderFiles(
    @Query() query: GetOrderFilesDto,
  ): Promise<OrderFilesPaginator> {
    return this.ordersService.getOrderFiles(query);
  }

  @Post('digital-file')
  @ApiOperation({ summary: 'Get digital file download URL' })
  @ApiResponse({
    status: 200,
    description: 'Download URL retrieved successfully',
  })
  async getDigitalFileDownloadUrl(
    @Body('digital_file_id', ParseIntPipe) digitalFileId: number,
  ): Promise<{ url: string }> {
    return this.ordersService.getDigitalFileDownloadUrl(digitalFileId);
  }
}

@ApiTags('Order Export')
@Controller('export-order-url')
export class OrderExportController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Export orders' })
  @ApiQuery({ name: 'shop_id', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Export URL generated successfully',
  })
  async orderExport(
    @Query('shop_id') shop_id: string,
  ): Promise<{ url: string }> {
    return this.ordersService.exportOrder(shop_id);
  }
}

@ApiTags('Invoice Download')
@Controller('download-invoice-url')
export class DownloadInvoiceController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Download invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice URL generated successfully',
  })
  async downloadInvoiceUrl(
    @Body('shop_id') shop_id: string,
  ): Promise<{ url: string }> {
    return this.ordersService.downloadInvoiceUrl(shop_id);
  }
}
