// src/modules/messages/messages.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagesPaginator } from './dto/get-messages.dto';
import { paginate } from '../common/pagination/paginate';
import { Conversation } from '../conversations/entities/conversation.entity';
import { SortOrder } from '../common/dto/generic-conditions.dto';


@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    // Check if conversation exists
    const conversation = await this.conversationRepository.findOne({
      where: { id: createMessageDto.conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${createMessageDto.conversation_id} not found`);
    }

    const message = this.messageRepository.create(createMessageDto);
    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's latest message and set unseen to true
    conversation.latest_message = savedMessage;
    conversation.unseen = true;
    await this.conversationRepository.save(conversation);

    return savedMessage;
  }

  async getMessages({
    page = 1,
    limit = 30,
    conversation_id,
    user_id,
    search,
    orderBy = 'created_at',
    sortedBy = SortOrder.DESC, // FIXED: Use enum value instead of string literal
    is_read,
  }: GetMessagesDto): Promise<MessagesPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Message> = {};

    if (conversation_id) {
      where.conversation_id = conversation_id;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (search) {
      where.body = Like(`%${search}%`);
    }

    if (is_read !== undefined) {
      where.is_read = is_read === 'true';
    }

    const order = {};
    order[orderBy] = sortedBy;

    const [results, total] = await this.messageRepository.findAndCount({
      where,
      take,
      skip,
      order,
      relations: ['user', 'conversation'],
    });

    const url = `/messages/conversations?conversation_id=${conversation_id || ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getMessageById(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['user', 'conversation', 'conversation.user', 'conversation.shop'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async markAsRead(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    message.is_read = true;
    return await this.messageRepository.save(message);
  }

  async deleteMessage(id: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    await this.messageRepository.remove(message);
  }
}