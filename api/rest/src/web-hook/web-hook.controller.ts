// web-hook/web-hook.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { WebHookService } from './web-hook.service';
import { WebhookResponseDto, RazorpayWebhookDto, StripeWebhookDto, PaypalWebhookDto } from './dto/webhook-response.dto';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('Webhooks')
@Controller('webhook')
@Public()
export class WebHookController {
  constructor(private readonly webHookService: WebHookService) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Razorpay webhook',
    description: 'Handle Razorpay payment webhook events'
  })
  @ApiHeader({
    name: 'x-razorpay-signature',
    description: 'Razorpay webhook signature',
    required: false,
  })
  @ApiBody({ type: RazorpayWebhookDto })
  @ApiOkResponse({
    description: 'Webhook processed successfully',
    type: WebhookResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid webhook payload' })
  async razorPayWebhook(
    @Body() webhookBody: RazorpayWebhookDto,
    @Headers('x-razorpay-signature') signature?: string,
  ): Promise<WebhookResponseDto> {
    return this.webHookService.handleRazorpayWebhook(webhookBody, signature);
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook',
    description: 'Handle Stripe payment webhook events'
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
    required: false,
  })
  @ApiBody({ type: StripeWebhookDto })
  @ApiOkResponse({
    description: 'Webhook processed successfully',
    type: WebhookResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid webhook payload' })
  async stripeWebhook(
    @Body() webhookBody: StripeWebhookDto,
    @Headers('stripe-signature') signature?: string,
  ): Promise<WebhookResponseDto> {
    return this.webHookService.handleStripeWebhook(webhookBody, signature);
  }

  @Post('paypal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PayPal webhook',
    description: 'Handle PayPal payment webhook events'
  })
  @ApiHeader({
    name: 'paypal-auth-algo',
    description: 'PayPal authentication algorithm',
    required: false,
  })
  @ApiBody({ type: PaypalWebhookDto })
  @ApiOkResponse({
    description: 'Webhook processed successfully',
    type: WebhookResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid webhook payload' })
  async paypalWebhook(
    @Body() webhookBody: PaypalWebhookDto,
    @Headers() headers: Record<string, string>,
  ): Promise<WebhookResponseDto> {
    return this.webHookService.handlePaypalWebhook(webhookBody, headers);
  }

  @Get('razorpay')
  @ApiOperation({
    summary: 'Test Razorpay webhook',
    description: 'Test endpoint for Razorpay webhook (GET)'
  })
  @ApiOkResponse({
    description: 'Test endpoint working',
    type: WebhookResponseDto
  })
  testRazorpay(): WebhookResponseDto {
    return this.webHookService.testRazorpay();
  }

  @Get('stripe')
  @ApiOperation({
    summary: 'Test Stripe webhook',
    description: 'Test endpoint for Stripe webhook (GET)'
  })
  @ApiOkResponse({
    description: 'Test endpoint working',
    type: WebhookResponseDto
  })
  testStripe(): WebhookResponseDto {
    return this.webHookService.testStripe();
  }

  @Get('paypal')
  @ApiOperation({
    summary: 'Test PayPal webhook',
    description: 'Test endpoint for PayPal webhook (GET)'
  })
  @ApiOkResponse({
    description: 'Test endpoint working',
    type: WebhookResponseDto
  })
  testPaypal(): WebhookResponseDto {
    return this.webHookService.testPaypal();
  }
}