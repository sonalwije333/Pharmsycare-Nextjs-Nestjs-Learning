// src/modules/conversations/conversations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Conversation } from './entities/conversation.entity';

import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsDto, ConversationPaginator } from './dto/get-conversations.dto';
import { paginate } from '../common/pagination/paginate';
import { Message } from '../messages/entities/message.entity';
import { SortOrder } from '../common/dto/generic-conditions.dto';


@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createConversationDto: CreateConversationDto): Promise<Conversation> {
    // Check if conversation already exists for this user and shop
    const existingConversation = await this.conversationRepository.findOne({
      where: {
        user_id: createConversationDto.user_id,
        shop_id: createConversationDto.shop_id,
      } as FindOptionsWhere<Conversation>,
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationRepository.create(createConversationDto);
    return await this.conversationRepository.save(conversation);
  }

  async getAllConversations({
    page = 1,
    limit = 30,
    search,
    orderBy = 'created_at',
    sortedBy = SortOrder.DESC,
    shop_id,
    user_id,
  }: GetConversationsDto): Promise<ConversationPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Conversation> = {};

    if (search) {
      where.user = { name: Like(`%${search}%`) } as any;
    }

    if (shop_id) {
      where.shop_id = parseInt(shop_id);
    }

    if (user_id) {
      where.user_id = user_id;
    }

    const order = {};
    order[orderBy] = sortedBy;

    const [results, total] = await this.conversationRepository.findAndCount({
      where,
      take,
      skip,
      order,
      relations: ['user', 'shop', 'latest_message', 'latest_message.user'],
    });

    const url = `/conversations?search=${search ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getConversation(idOrUserId: string): Promise<Conversation> {
    let conversation: Conversation | null = null;

    // Try to find by ID first
    if (!isNaN(Number(idOrUserId))) {
      conversation = await this.conversationRepository.findOne({
        where: { id: parseInt(idOrUserId) },
        relations: ['user', 'shop', 'messages', 'messages.user', 'latest_message', 'latest_message.user'],
      });
    }

    // If not found by ID, try to find by user ID
    if (!conversation) {
      conversation = await this.conversationRepository.findOne({
        where: { user_id: idOrUserId },
        relations: ['user', 'shop', 'messages', 'messages.user', 'latest_message', 'latest_message.user'],
      });
    }

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID or user ID ${idOrUserId} not found`);
    }

    return conversation;
  }

  async updateConversation(id: number, updateData: Partial<Conversation>): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    Object.assign(conversation, updateData);
    return await this.conversationRepository.save(conversation);
  }

  async deleteConversation(id: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Delete associated messages first
    if (conversation.messages && conversation.messages.length > 0) {
      await this.messageRepository.remove(conversation.messages);
    }

    await this.conversationRepository.remove(conversation);
  }

  async markAsRead(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    conversation.unseen = false;
    return await this.conversationRepository.save(conversation);
  }
}