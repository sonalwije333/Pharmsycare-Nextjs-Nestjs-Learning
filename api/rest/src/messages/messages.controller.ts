import { Body, Controller, Get, Param, Post, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagePaginator } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission, SortOrder } from '../common/enums/enums';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';


@ApiTags('💬 Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER, Permission.STAFF)
  @ApiOperation({
    summary: 'Create a new message',
    description: 'Send a message in a conversation'
  })
  @ApiCreatedResponse({
    description: 'Message created successfully',
    type: () => Message
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateMessageDto })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ): Promise<Message> {
    if (user?.id && !createMessageDto.user_id) {
      createMessageDto.user_id = user.id;
    }
    return this.messagesService.create(createMessageDto);
  }

  @Get('conversation/:conversationId')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER, Permission.STAFF)
  @ApiOperation({
    summary: 'Get messages by conversation',
    description: 'Retrieve messages for a specific conversation'
  })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    type: () => MessagePaginator
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findByConversation(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query() query: GetMessagesDto,
    @CurrentUser() user: any,
  ): Promise<MessagePaginator> {
    return this.messagesService.findByConversation(conversationId, query, user);
  }
}