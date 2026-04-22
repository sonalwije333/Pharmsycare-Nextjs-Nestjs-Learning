// messages/messages.controller.ts
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { GetConversationsDto } from 'src/conversations/dto/get-conversations.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagePaginator } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';


@ApiTags('💬 Messages')
@Controller('messages/conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER, Permission.STAFF)
  @ApiOperation({
    summary: 'Create a new message',
    description: 'Send a message in a conversation'
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
    type: Number,
    example: 1
  })
  @ApiCreatedResponse({
    description: 'Message created successfully',
    type: Message
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateMessageDto })
  createMessage(@Param('id') id: string, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get(':param')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER, Permission.STAFF)
  @ApiOperation({
    summary: 'Get messages',
    description: 'Retrieve messages for a conversation'
  })
  @ApiParam({
    name: 'param',
    description: 'Conversation ID or "all" for all messages',
    example: '1'
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    type: MessagePaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getMessages(@Param('param') param: string, @Query() query: GetMessagesDto): Promise<MessagePaginator> {
    return this.messagesService.getMessages(query);
  }
}