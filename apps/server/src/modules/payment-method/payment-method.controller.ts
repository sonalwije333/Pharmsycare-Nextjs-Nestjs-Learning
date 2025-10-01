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
import { PermissionType } from '../../common/enums/enums';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto';
import { DefaultCartDto } from './dto/set-default-card.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@ApiTags('Payment Methods')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment method', description: 'Creates a new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully', type: PaymentMethod })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get all payment methods', description: 'Retrieves all payment methods for the user' })
  @ApiQuery({ name: 'text', required: false, type: String, description: 'Search text' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully', type: [PaymentMethod] })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findAll(@Query() query: GetPaymentMethodsDto): Promise<PaymentMethod[]> {
    return this.paymentMethodService.findAll();
  }

  @Get(':id')
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get payment method by ID', description: 'Retrieves a specific payment method' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiResponse({ status: 200, description: 'Payment method retrieved successfully', type: PaymentMethod })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentMethod> {
    return this.paymentMethodService.findOne(id);
  }

  @Put(':id')
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Update payment method', description: 'Updates an existing payment method' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully', type: PaymentMethod })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method', description: 'Permanently deletes a payment method' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiResponse({ status: 204, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentMethodService.remove(id);
  }
}

@ApiTags('Payment Methods')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('set-default-card')
export class SetDefaultCartController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Set default card', description: 'Sets a payment method as the default card' })
  @ApiResponse({ status: 200, description: 'Default card set successfully', type: PaymentMethod })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  setDefaultCart(@Body() defaultCartDto: DefaultCartDto): Promise<PaymentMethod> {
    return this.paymentMethodService.saveDefaultCart(defaultCartDto);
  }
}