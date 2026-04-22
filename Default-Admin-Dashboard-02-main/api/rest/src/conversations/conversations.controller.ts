// conversations/conversations.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ParseIntPipe,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
  ConversationPaginator,
  GetConversationsDto,
} from './dto/get-conversations.dto';
import { Conversation } from './entities/conversation.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {Roles} from "../common/decorators/roles.decorator";

@ApiTags('💬 Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new conversation',
    description: 'Creates a new conversation between user and shop',
  })
  @ApiCreatedResponse({
    description: 'Conversation created successfully',
    type: Conversation,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreateConversationDto })
  createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: any,
  ): Promise<Conversation> {
    // If user is not admin, use their own ID
    if (!user?.permissions?.includes(Permission.SUPER_ADMIN)) {
      createConversationDto.user_id = user.id;
    }
    return this.conversationsService.create(createConversationDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all conversations',
    description: 'Retrieve paginated list of all conversations',
  })
  @ApiOkResponse({
    description: 'Conversations retrieved successfully',
    type: ConversationPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async getConversations(
    @Query() query: GetConversationsDto,
    @CurrentUser() user: any,
  ): Promise<ConversationPaginator> {
    // Filter by user if not admin
    if (!user?.permissions?.includes(Permission.SUPER_ADMIN)) {
      if (user?.permissions?.includes(Permission.STORE_OWNER)) {
        query.shop_id = user.shop_id;
      } else {
        query.user_id = user.id;
      }
    }
    return this.conversationsService.getAllConversations(query);
  }

  @Get(':param')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get conversation by ID',
    description: 'Retrieve conversation details by ID',
  })
  @ApiParam({ name: 'param', description: 'Conversation ID', type: Number })
  @ApiOkResponse({
    description: 'Conversation retrieved successfully',
    type: Conversation,
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  getConversation(
    @Param('param') param: string,
    @CurrentUser() user: any,
  ): Promise<Conversation> {
    if (!/^\d+$/.test(param)) {
      throw new NotFoundException(`Conversation with ID ${param} not found`);
    }

    return this.conversationsService.getConversation(Number(param), user);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update conversation',
    description: 'Update conversation information by ID',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiOkResponse({
    description: 'Conversation updated successfully',
    type: Conversation,
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBody({ type: UpdateConversationDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    return this.conversationsService.update(id, updateConversationDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete conversation',
    description: 'Permanently delete a conversation by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiOkResponse({
    description: 'Conversation deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.conversationsService.remove(id);
  }

  @Post(':id/mark-read')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Mark conversation as read',
    description: 'Mark conversation as read for the current user',
  })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: Number })
  @ApiOkResponse({
    description: 'Conversation marked as read',
    type: Conversation,
  })
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<Conversation> {
    return this.conversationsService.markAsRead(id, user);
  }
}
