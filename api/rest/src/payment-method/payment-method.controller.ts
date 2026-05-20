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
  ParseIntPipe,
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
} from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto, PaymentMethodPaginator } from './dto/get-payment-methods.dto';
import { SetDefaultCardDto } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission, SortOrder } from 'src/common/enums/enums';
import { PaymentMethodOrderByColumn, PaymentMethodType } from 'src/common/enums/payment-method.enum';

@ApiTags('💳 Payment Methods')
@Controller('payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Create payment method', description: 'Create a new payment method' })
  @ApiCreatedResponse({ description: 'Payment method created successfully', type: () => PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreatePaymentMethodDto })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get all payment methods', description: 'Retrieve paginated list of payment methods' })
  @ApiOkResponse({ description: 'Payment methods retrieved successfully', type: () => PaymentMethodPaginator })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetPaymentMethodsDto): Promise<PaymentMethodPaginator> {
    return this.paymentMethodService.findAll(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get payment method by ID', description: 'Retrieve a single payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Payment method retrieved successfully', type: () => PaymentMethod })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentMethod> {
    return this.paymentMethodService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({ summary: 'Update payment method', description: 'Update payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Payment method updated successfully', type: () => PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdatePaymentMethodDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    return this.paymentMethodService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment method', description: 'Soft delete payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Payment method deleted successfully', type: CoreMutationOutput })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.paymentMethodService.remove(id);
  }
}

@ApiTags('💳 Save Payment Method')
@Controller('payment-methods/save')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SavePaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Save payment method', description: 'Save a new payment method for future use' })
  @ApiCreatedResponse({ description: 'Payment method saved successfully', type: () => PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreatePaymentMethodDto })
  savePaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    createPaymentMethodDto.default_card = false;
    return this.paymentMethodService.savePaymentMethod(createPaymentMethodDto);
  }
}

@ApiTags('💳 Set Default Card')
@Controller('payment-methods/default')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SetDefaultCardController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Set default card', description: 'Set a payment method as the default card' })
  @ApiOkResponse({ description: 'Default card set successfully', type: () => PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid payment method ID' })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: SetDefaultCardDto })
  setDefaultCard(@Body() setDefaultCardDto: SetDefaultCardDto): Promise<PaymentMethod> {
    return this.paymentMethodService.setDefaultCard(setDefaultCardDto);
  }
}