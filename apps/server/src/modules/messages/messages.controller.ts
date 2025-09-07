// src/modules/messages/messages.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Delete,
  Patch,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagesPaginator } from './dto/get-messages.dto';
import { Message } from './entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Create a new message', description: 'Creates a new message in a conversation.' })
  @ApiResponse({ status: 201, description: 'Message successfully created', type: Message })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get messages', description: 'Retrieves messages with filtering and pagination.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'conversation_id', required: false, type: Number, description: 'Conversation ID filter' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID filter' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by column' })
  @ApiQuery({ name: 'sortedBy', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiQuery({ name: 'is_read', required: false, type: String, description: 'Is read filter' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully', type: MessagesPaginator })
  async getMessages(
    @Query() query: GetMessagesDto,
  ): Promise<MessagesPaginator> {
    return this.messagesService.getMessages(query);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get message by ID', description: 'Retrieves a specific message by its ID.' })
  @ApiParam({ name: 'id', description: 'Message ID', type: Number })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully', type: Message })
  @ApiResponse({ status: 404, description: 'Message not found' })
  getMessageById(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.getMessageById(id);
  }

  @Patch(':id/read')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Mark message as read', description: 'Marks a message as read.' })
  @ApiParam({ name: 'id', description: 'Message ID', type: Number })
  @ApiResponse({ status: 200, description: 'Message marked as read', type: Message })
  @ApiResponse({ status: 404, description: 'Message not found' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markAsRead(id);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Delete message', description: 'Permanently deletes a message.' })
  @ApiParam({ name: 'id', description: 'Message ID', type: Number })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  deleteMessage(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.deleteMessage(id);
  }
}