import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {StripePaymentService} from "./stripe-payment.service";

import {StripePaymentIntent} from "./entity/stripe.entity";
import {CreatePaymentIntentDto} from "./dto/stripe.dto";

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/payments')
export class PaymentController {
  constructor(
    private readonly stripePaymentService: StripePaymentService

  ) {}

  @Post('stripe/intent')
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Stripe payment intent',
    description: 'Creates a new Stripe payment intent for processing payments'
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    type: StripePaymentIntent
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
  })
  async createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ): Promise<StripePaymentIntent> {
    return this.stripePaymentService.createPaymentIntent(createPaymentIntentDto);
  }



}