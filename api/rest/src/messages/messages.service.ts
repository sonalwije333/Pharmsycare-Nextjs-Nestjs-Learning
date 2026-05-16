import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagePaginator } from './dto/get-messages.dto';
import { paginate } from '../common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { MessageOrderByColumn } from 'src/common/enums/message-order-by.enum';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: createMessageDto.conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${createMessageDto.conversation_id} not found`,
      );
    }

    const message = this.messageRepository.create({
      conversation_id: createMessageDto.conversation_id,
      user_id: createMessageDto.user_id,
      body: createMessageDto.body,
    });

    return this.messageRepository.save(message);
  }

  async findByConversation(
    conversationId: number,
    {
      page = 1,
      limit = 30,
      search,
      orderBy = MessageOrderByColumn.CREATED_AT,
      sortedBy = SortOrder.DESC,
    }: GetMessagesDto,
    user?: any,
  ): Promise<MessagePaginator> {
    // Verify conversation exists
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    // Check permission
    const isAdmin = user?.permissions?.includes('super_admin');
    const isParticipant = conversation.user_id === user?.id || conversation.shop_id === user?.shop_id;

    if (!isAdmin && !isParticipant) {
      throw new ForbiddenException('You do not have permission to view messages in this conversation');
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId });

    if (search) {
      queryBuilder.andWhere('LOWER(message.body) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    const orderColumn =
      orderBy === MessageOrderByColumn.ID
        ? 'message.id'
        : orderBy === MessageOrderByColumn.UPDATED_AT
          ? 'message.updated_at'
          : 'message.created_at';

    queryBuilder.orderBy(orderColumn, sortedBy === SortOrder.ASC ? 'ASC' : 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [results, total] = await queryBuilder.getManyAndCount();
    
    const url = `/messages/conversation/${conversationId}?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  // Helper method to get message by ID
  async findById(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });
    
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    
    return message;
  }
}