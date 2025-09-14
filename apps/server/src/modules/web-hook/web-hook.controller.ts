import { WebHookService } from './web-hook.service';
import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiExcludeEndpoint,
} from '@nestjs/swagger';

@ApiTags('Webhooks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/web-hook')
export class WebHookController {
    constructor(private readonly webHookService: WebHookService) {}

    @Get('razorpay')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({
        summary: 'Razorpay webhook test',
        description: 'Test endpoint for Razorpay webhook integration. Requires admin privileges.'
    })
    @ApiResponse({
        status: 200,
        description: 'Razorpay webhook test executed successfully'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    razorPay() {
        return this.webHookService.razorPay();
    }

    @Get('stripe')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({
        summary: 'Stripe webhook test',
        description: 'Test endpoint for Stripe webhook integration. Requires admin privileges.'
    })
    @ApiResponse({
        status: 200,
        description: 'Stripe webhook test executed successfully'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    stripe() {
        return this.webHookService.stripe();
    }

    @Get('paypal')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({
        summary: 'PayPal webhook test',
        description: 'Test endpoint for PayPal webhook integration. Requires admin privileges.'
    })
    @ApiResponse({
        status: 200,
        description: 'PayPal webhook test executed successfully'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    paypal() {
        return this.webHookService.paypal();
    }

    // Additional webhook endpoints for actual webhook processing (typically POST)
    @Post('razorpay/webhook')
    @ApiExcludeEndpoint() // Exclude from Swagger if these are internal endpoints
    @ApiOperation({
        summary: 'Razorpay webhook receiver',
        description: 'Endpoint for receiving Razorpay webhook notifications'
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid webhook payload'
    })
    razorPayWebhook(@Body() payload: any) {
        return this.webHookService.processRazorpayWebhook(payload);
    }

    @Post('stripe/webhook')
    @ApiExcludeEndpoint()
    @ApiOperation({
        summary: 'Stripe webhook receiver',
        description: 'Endpoint for receiving Stripe webhook notifications'
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid webhook payload'
    })
    stripeWebhook(@Body() payload: any) {
        return this.webHookService.processStripeWebhook(payload);
    }

    @Post('paypal/webhook')
    @ApiExcludeEndpoint()
    @ApiOperation({
        summary: 'PayPal webhook receiver',
        description: 'Endpoint for receiving PayPal webhook notifications'
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid webhook payload'
    })
    paypalWebhook(@Body() payload: any) {
        return this.webHookService.processPaypalWebhook(payload);
    }

    // Health check endpoint for webhook services
    @Get('health')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({
        summary: 'Webhook health check',
        description: 'Check the status of webhook integrations'
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook services are healthy'
    })
    healthCheck() {
        return this.webHookService.healthCheck();
    }

    // Get webhook configuration
    @Get('config')
    @Roles(PermissionType.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get webhook configuration',
        description: 'Retrieve webhook configuration settings. Requires super admin privileges.'
    })
    @ApiResponse({
        status: 200,
        description: 'Configuration retrieved successfully'
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - insufficient permissions'
    })
    getConfig() {
        return this.webHookService.getWebhookConfig();
    }
}