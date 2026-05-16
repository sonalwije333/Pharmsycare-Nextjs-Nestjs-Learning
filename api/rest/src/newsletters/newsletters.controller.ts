import { Body, Controller, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { NewslettersService } from './newsletters.service';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
import { NewsletterSubscriptionResponse, NewsletterUnsubscribeResponse } from './dto/newsletter-response.dto';

@ApiTags('📧 Newsletters')
@Controller('newsletters')
export class NewslettersController {
  constructor(private newslettersService: NewslettersService) {}

  @Post('subscribe')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to newsletter',
    description: 'Subscribe a new email address to the newsletter'
  })
  @ApiCreatedResponse({
    description: 'Successfully subscribed to newsletter',
    type: () => NewsletterSubscriptionResponse,
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid email address or email already subscribed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email already subscribed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiBody({ type: CreateNewSubscriberDto })
  async subscribe(@Body() body: CreateNewSubscriberDto): Promise<NewsletterSubscriptionResponse> {
    return this.newslettersService.subscribe(body);
  }

  @Post('subscribe-to-newsletter')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to newsletter',
    description: 'Subscribe a new email address to the newsletter'
  })
  @ApiCreatedResponse({
    description: 'Successfully subscribed to newsletter',
    type: () => NewsletterSubscriptionResponse,
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid email address or email already subscribed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email already subscribed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiBody({ type: CreateNewSubscriberDto })
  async subscribeToNewsletter(@Body() body: CreateNewSubscriberDto): Promise<NewsletterSubscriptionResponse> {
    return this.newslettersService.subscribe(body);
  }

  @Delete('unsubscribe/:email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unsubscribe from newsletter',
    description: 'Unsubscribe an email address from the newsletter'
  })
  @ApiParam({
    name: 'email',
    description: 'Email address to unsubscribe',
    example: 'user@example.com',
    type: String,
  })
  @ApiOkResponse({
    description: 'Successfully unsubscribed from newsletter',
    type: () => NewsletterUnsubscribeResponse,
  })
  @ApiNotFoundResponse({ description: 'Email not found in subscribers' })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  async unsubscribe(@Param('email') email: string): Promise<NewsletterUnsubscribeResponse> {
    return this.newslettersService.unsubscribe(email);
  }

  @Delete('admin/:email')
  @Roles(Permission.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin remove subscriber',
    description: 'Remove a subscriber from newsletter (Admin only)'
  })
  @ApiParam({
    name: 'email',
    description: 'Email address to remove',
    example: 'user@example.com',
    type: String,
  })
  @ApiOkResponse({
    description: 'Subscriber removed successfully',
    type: () => NewsletterUnsubscribeResponse,
  })
  @ApiNotFoundResponse({ description: 'Email not found in subscribers' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async adminRemove(@Param('email') email: string): Promise<NewsletterUnsubscribeResponse> {
    return this.newslettersService.adminRemove(email);
  }
}

@ApiTags('📧 Newsletters')
@Controller()
export class LegacyNewslettersController {
  constructor(private newslettersService: NewslettersService) {}

  @Post('subscribe-to-newsletter')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to newsletter',
    description: 'Subscribe a new email address to the newsletter'
  })
  @ApiCreatedResponse({
    description: 'Successfully subscribed to newsletter',
    type: () => NewsletterSubscriptionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid email address or email already subscribed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email already subscribed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiBody({ type: CreateNewSubscriberDto })
  async subscribe(@Body() body: CreateNewSubscriberDto): Promise<NewsletterSubscriptionResponse> {
    return this.newslettersService.subscribe(body);
  }
}