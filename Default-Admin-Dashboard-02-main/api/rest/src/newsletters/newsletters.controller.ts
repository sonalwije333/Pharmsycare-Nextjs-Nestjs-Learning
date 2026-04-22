// newsletters/newsletters.controller.ts
import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NewslettersService } from './newsletters.service';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';


@ApiTags('📧 Newsletters')
@Controller('subscribe-to-newsletter')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NewslettersController {
  constructor(private newslettersService: NewslettersService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Subscribe to newsletter',
    description: 'Subscribe a new email address to the newsletter'
  })
  @ApiOkResponse({
    description: 'Successfully subscribed to newsletter',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Your email successfully subscribed' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid email address' })
  @ApiBody({ type: CreateNewSubscriberDto })
  async subscribeToNewsletter(@Body() body: CreateNewSubscriberDto) {
    return this.newslettersService.subscribeToNewsletter(body);
  }
}