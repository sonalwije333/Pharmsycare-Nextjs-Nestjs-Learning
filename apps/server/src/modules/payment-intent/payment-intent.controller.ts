import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PaymentIntentService } from './payment-intent.service';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {PaymentIntent} from "./entries/payment-intent.entity";
import { PermissionType } from '../../common/enums/PermissionType.enum';


@ApiTags('Payment Intents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/payment-intents')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}

  @Get()
  @Roles(PermissionType.CUSTOMER, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get payment intent', description: 'Retrieves payment intent for an order' })
  @ApiQuery({ name: 'tracking_number', required: true, type: Number, description: 'Order tracking number' })
  @ApiQuery({ name: 'payment_gateway', required: true, type: String, description: 'Payment gateway' })
  @ApiQuery({ name: 'recall_gateway', required: true, type: Boolean, description: 'Recall gateway' })
  @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully', type: PaymentIntent })
  @ApiResponse({ status: 404, description: 'Payment intent not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getPaymentIntent(@Query() query: GetPaymentIntentDto): Promise<PaymentIntent> {
    return this.paymentIntentService.getPaymentIntent(query);
  }
}