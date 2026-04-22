// payment-intent/payment-intent.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntentService } from './payment-intent.service';
import { PaymentIntent } from './entities/payment-intent.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';


@ApiTags('💳 Payment Intent')
@Controller('payment-intent')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({ summary: 'Get payment intent', description: 'Retrieve payment intent by tracking number' })
  @ApiOkResponse({ description: 'Payment intent retrieved successfully', type: PaymentIntent })
  async getPaymentIntent(@Query() query: GetPaymentIntentDto) {
    return this.paymentIntentService.getPaymentIntent(query);
  }
}