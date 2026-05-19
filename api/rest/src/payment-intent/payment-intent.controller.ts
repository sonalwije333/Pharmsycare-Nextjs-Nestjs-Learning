import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiBadRequestResponse, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentIntent } from './entities/payment-intent.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { PaypalCreateIntentParam, PaypalOrderResponse } from '../payment/dto/create-payment-intent.dto';

@ApiTags('💳 Payment Intent')
@Controller('payment-intent')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Create payment intent', description: 'Create a payment intent for checkout' })
  @ApiCreatedResponse({ description: 'Payment intent created successfully', type: () => PaypalOrderResponse })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: PaypalCreateIntentParam })
  async createPaymentIntent(@Body() body: PaypalCreateIntentParam): Promise<PaypalOrderResponse> {
    return this.paymentIntentService.createPaymentIntent(body);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get payment intent', description: 'Retrieve payment intent by tracking number' })
  @ApiOkResponse({ description: 'Payment intent retrieved successfully', type: () => PaymentIntent })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getPaymentIntent(@Query() query: GetPaymentIntentDto): Promise<PaymentIntent> {
    return this.paymentIntentService.getPaymentIntent(query);
  }
}