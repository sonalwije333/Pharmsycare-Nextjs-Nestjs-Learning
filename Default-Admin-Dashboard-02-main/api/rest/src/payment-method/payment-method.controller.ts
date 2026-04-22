// payment-method/payment-method.controller.ts
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
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto, PaymentMethodPaginator } from './dto/get-payment-methods.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethod } from './entities/payment-method.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';


@ApiTags('💳 Payment Methods')
@Controller('cards')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Create payment method', description: 'Create a new payment method' })
  @ApiCreatedResponse({ description: 'Payment method created successfully', type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreatePaymentMethodDto })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get all payment methods', description: 'Retrieve paginated list of payment methods' })
  @ApiOkResponse({ description: 'Payment methods retrieved successfully', type: PaymentMethodPaginator })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetPaymentMethodsDto) {
    return this.paymentMethodService.findAll(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get payment method by ID', description: 'Retrieve a single payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiOkResponse({ description: 'Payment method retrieved successfully', type: PaymentMethod })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({ summary: 'Update payment method', description: 'Update payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiOkResponse({ description: 'Payment method updated successfully', type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdatePaymentMethodDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTaxDto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(id, updateTaxDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment method', description: 'Delete payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID', type: Number })
  @ApiOkResponse({ description: 'Payment method deleted successfully', type: CoreMutationOutput })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.remove(id);
  }
}

@ApiTags('💳 Save Payment Method')
@Controller('save-payment-method')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SavePaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Save payment method', description: 'Save a new payment method for future use' })
  @ApiCreatedResponse({ description: 'Payment method saved successfully', type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreatePaymentMethodDto })
  savePaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    createPaymentMethodDto.default_card = false;
    return this.paymentMethodService.savePaymentMethod(createPaymentMethodDto);
  }
}

@ApiTags('💳 Set Default Card')
@Controller('set-default-card')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class SetDefaultCartController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Set default card', description: 'Set a payment method as the default card' })
  @ApiOkResponse({ description: 'Default card set successfully', type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Invalid payment method ID' })
  @ApiNotFoundResponse({ description: 'Payment method not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: DefaultCart })
  setDefaultCart(@Body() defaultCart: DefaultCart) {
    return this.paymentMethodService.saveDefaultCart(defaultCart);
  }
}