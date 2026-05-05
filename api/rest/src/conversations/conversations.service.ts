import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { SortOrder, Permission } from '../common/enums/enums';
import { ConversationOrderByColumn } from 'src/common/enums/conversation-order-by.enum';


@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private latestMessageRepository: Repository<LatestMessage>,
  ) {}

  async create(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const existing = await this.conversationRepository.findOne({
      where: {
        user_id: createConversationDto.user_id.toString(),
        shop_id: createConversationDto.shop_id,
      },
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationRepository.create({
      user_id: createConversationDto.user_id.toString(),
      shop_id: createConversationDto.shop_id,
      unseen: true,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    if (createConversationDto.message) {
      const latestMessage = this.latestMessageRepository.create({
        body: createConversationDto.message,
        conversation_id: savedConversation.id.toString(),
        user_id: createConversationDto.user_id.toString(),
      });

      const savedMessage = await this.latestMessageRepository.save(latestMessage);

      savedConversation.latest_message = savedMessage;
      savedConversation.latest_message_id = savedMessage.id;
      await this.conversationRepository.save(savedConversation);
    }

    return this.findOneById(savedConversation.id);
  }

  async findAll({
    page = 1,
    limit = 30,
    search,
    user_id,
    shop_id,
    unseen,
    orderBy = ConversationOrderByColumn.UPDATED_AT,
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

    if (unseen !== undefined) {
      queryBuilder.andWhere('conversation.unseen = :unseen', { unseen });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR latest_message.body LIKE :search)',
        { search: `%${search}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case ConversationOrderByColumn.USER_ID:
        orderColumn = 'conversation.user_id';
        break;
      case ConversationOrderByColumn.SHOP_ID:
        orderColumn = 'conversation.shop_id';
        break;
      case ConversationOrderByColumn.UNSEEN:
        orderColumn = 'conversation.unseen';
        break;
      case ConversationOrderByColumn.CREATED_AT:
        orderColumn = 'conversation.created_at';
        break;
      default:
        orderColumn = 'conversation.updated_at';
    }

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

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

  async findOne(id: number, user?: any): Promise<Conversation> {
    const conversation = await this.findOneById(id);

    if (user && !user?.permissions?.includes(Permission.SUPER_ADMIN)) {
      const userId = user.id?.toString();
      const shopId = user.shop_id;
      
      if (conversation.user_id !== userId && conversation.shop_id !== shopId) {
        throw new ForbiddenException('You do not have permission to view this conversation');
      }
    }

    return conversation;
  }

  async findOneById(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['user', 'latest_message'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async update(id: number, updateConversationDto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.findOneById(id);

    if (updateConversationDto.shop_id !== undefined) {
      conversation.shop_id = updateConversationDto.shop_id;
    }

    if (updateConversationDto.user_id !== undefined) {
      conversation.user_id = updateConversationDto.user_id.toString();
    }

    return this.conversationRepository.save(conversation);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const conversation = await this.findOneById(id);

    if (conversation.latest_message) {
      await this.latestMessageRepository.softDelete(conversation.latest_message.id);
    }

    await this.conversationRepository.softDelete(id);

    return {
      success: true,
      message: `Conversation with ID ${id} deleted successfully`,
    };
  }

  async markAsRead(id: number, user: any): Promise<Conversation> {
    const conversation = await this.findOneById(id);

    const userId = user.id?.toString();
    const shopId = user.shop_id;

    if (conversation.user_id === userId || conversation.shop_id === shopId) {
      conversation.unseen = false;
      return this.conversationRepository.save(conversation);
    }

    throw new ForbiddenException('You do not have permission to mark this conversation as read');
  }

  async addMessage(
    conversationId: number,
    userId: number,
    message: string,
  ): Promise<Conversation> {
    const conversation = await this.findOneById(conversationId);

    const latestMessage = this.latestMessageRepository.create({
      body: message,
      conversation_id: conversationId.toString(),
      user_id: userId.toString(),
    });

    const savedMessage = await this.latestMessageRepository.save(latestMessage);

    conversation.latest_message = savedMessage;
    conversation.latest_message_id = savedMessage.id;
    conversation.unseen = true;
    conversation.updated_at = new Date();

    return this.conversationRepository.save(conversation);
  }
}