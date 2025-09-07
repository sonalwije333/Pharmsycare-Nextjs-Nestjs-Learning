// src/modules/conversations/conversations.controller.ts
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
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import {
  ConversationPaginator,
  GetConversationsDto,
} from './dto/get-conversations.dto';
import { Conversation } from './entities/conversation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';

@ApiTags('Conversations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Create a new conversation', description: 'Creates a new conversation between user and shop.' })
  @ApiResponse({ status: 201, description: 'Conversation successfully created', type: Conversation })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  createConversation(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get all conversations', description: 'Retrieves a list of conversations with filtering and pagination.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by column' })
  @ApiQuery({ name: 'sortedBy', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID filter' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully', type: ConversationPaginator })
  async getConversations(
    @Query() query: GetConversationsDto,
  ): Promise<ConversationPaginator> {
    return this.conversationsService.getAllConversations(query);
  }

  @Get(':param')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get conversation by ID or user ID', description: 'Retrieves a specific conversation by its ID or user ID.' })
  @ApiParam({ name: 'param', description: 'Conversation ID or User ID', type: String })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully', type: Conversation })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  getConversation(@Param('param') param: string) {
    return this.conversationsService.getConversation(param);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Update conversation', description: 'Updates an existing conversation.' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiResponse({ status: 200, description: 'Conversation updated successfully', type: Conversation })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  updateConversation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<Conversation>,
  ) {
    return this.conversationsService.updateConversation(id, updateData);
  }

  @Patch(':id/read')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Mark conversation as read', description: 'Marks a conversation as read by setting unseen to false.' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiResponse({ status: 200, description: 'Conversation marked as read', type: Conversation })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.markAsRead(id);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Delete conversation', description: 'Permanently deletes a conversation and all its messages.' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  deleteConversation(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.deleteConversation(id);
  }
}