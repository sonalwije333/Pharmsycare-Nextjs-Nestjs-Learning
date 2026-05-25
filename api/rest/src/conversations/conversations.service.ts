// conversations/conversations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import {
  GetConversationsDto,
  ConversationPaginator,
} from './dto/get-conversations.dto';
import { Conversation } from './entities/conversation.entity';
import { LatestMessage } from './entities/latest-message.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private latestMessageRepository: Repository<LatestMessage>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    // Check if conversation already exists between user and shop
    const existing = await this.conversationRepository.findOne({
      where: {
        user_id: createConversationDto.user_id.toString(),
        shop_id: createConversationDto.shop_id,
      },
    });

    if (existing) {
      return existing;
    }

    // Create conversation
    const conversation = this.conversationRepository.create({
      user_id: createConversationDto.user_id.toString(),
      shop_id: createConversationDto.shop_id,
      unseen: true,
    });

    const savedConversation = await this.conversationRepository.save(
      conversation,
    );

    // If initial message provided, create latest message
    if (createConversationDto.message) {
      const latestMessage = this.latestMessageRepository.create({
        body: createConversationDto.message,
        conversation_id: savedConversation.id.toString(),
        user_id: createConversationDto.user_id.toString(),
      });

      const savedMessage = await this.latestMessageRepository.save(
        latestMessage,
      );

      savedConversation.latest_message = savedMessage;
      savedConversation.latest_message_id = savedMessage.id;
      await this.conversationRepository.save(savedConversation);
    }

    return this.findOne(savedConversation.id);
  }

  async getAllConversations({
    page = 1,
    limit = 30,
    search,
    user_id,
    shop_id,
    orderBy = 'updated_at',
    sortedBy = SortOrder.DESC,
  }: GetConversationsDto): Promise<ConversationPaginator> {
    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user', 'user')
      .leftJoinAndSelect('conversation.latest_message', 'latest_message');

    if (user_id) {
      queryBuilder.andWhere('conversation.user_id = :user_id', {
        user_id: user_id.toString(),
      });
    }

    if (shop_id) {
      queryBuilder.andWhere('conversation.shop_id = :shop_id', { shop_id });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR latest_message.body LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Validate and sanitize orderBy to prevent SQL injection
    const allowedFields = ['id', 'created_at', 'updated_at', 'unseen'];
    const validOrderBy = allowedFields.includes(orderBy?.toLowerCase())
      ? orderBy
      : 'updated_at';

    // Convert sortedBy to uppercase for TypeORM
    const orderDirection = sortedBy?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`conversation.${validOrderBy}`, orderDirection);
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/conversations?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getConversation(param: number, user?: any): Promise<Conversation> {
    const conversation = await this.findOne(param);

    // Check permissions
    if (user && !user?.permissions?.includes('super_admin')) {
      if (
        conversation.user_id !== user.id.toString() &&
        conversation.shop_id !== user.shop_id
      ) {
        throw new BadRequestException(
          'You do not have permission to view this conversation',
        );
      }
    }

    return conversation;
  }

  async findOne(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['user', 'shop', 'latest_message'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async update(
    id: number,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);

    if (updateConversationDto.shop_id !== undefined) {
      conversation.shop_id = updateConversationDto.shop_id;
    }

    return this.conversationRepository.save(conversation);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const conversation = await this.findOne(id);

    // Delete associated latest message
    if (conversation.latest_message) {
      await this.latestMessageRepository.remove(conversation.latest_message);
    }

    await this.conversationRepository.remove(conversation);

    return {
      success: true,
      message: `Conversation with ID ${id} deleted successfully`,
    };
  }

  async markAsRead(id: number, user: any): Promise<Conversation> {
    const conversation = await this.findOne(id);

    // Only mark as read if user is part of the conversation
    if (
      conversation.user_id === user.id.toString() ||
      conversation.shop_id === user.shop_id
    ) {
      conversation.unseen = false;
      return this.conversationRepository.save(conversation);
    }

    throw new BadRequestException(
      'You do not have permission to mark this conversation as read',
    );
  }

  async addMessage(
    conversationId: number,
    userId: number,
    message: string,
  ): Promise<Conversation> {
    const conversation = await this.findOne(conversationId);

    // Create new latest message
    const latestMessage = this.latestMessageRepository.create({
      body: message,
      conversation_id: conversationId.toString(),
      user_id: userId.toString(),
    });

    const savedMessage = await this.latestMessageRepository.save(latestMessage);

    // Update conversation
    conversation.latest_message = savedMessage;
    conversation.latest_message_id = savedMessage.id;
    conversation.unseen = true;
    conversation.updated_at = new Date();

    return this.conversationRepository.save(conversation);
  }
}
