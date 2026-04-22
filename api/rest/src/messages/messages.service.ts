// messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import MessagesJson from '@db/messages.json';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto, MessagePaginator } from './dto/get-messages.dto';
import { paginate } from '../common/pagination/paginate';

const messages = plainToClass(Message, MessagesJson);

@Injectable()
export class MessagesService {
  private messages: Message[] = messages;

  createMessage(createMessageDto: CreateMessageDto) {
    return this.messages[0];
  }

  getMessages({ search, limit, page, sortedBy = 'created_at', orderBy = 'DESC' }: GetMessagesDto): Promise<MessagePaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    
    let data: Message[] = [...this.messages];
    
    if (search) {
      data = data.filter(m => 
        m.body.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    data.sort((a, b) => {
      const aValue = a[sortedBy as keyof Message];
      const bValue = b[sortedBy as keyof Message];
      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);
    
    const url = `/messages/conversations?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);
    
    return Promise.resolve({
      data: results,
      ...paginationInfo,
    });
  }
}