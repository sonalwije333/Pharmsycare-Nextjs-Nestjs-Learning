// messages/dto/get-messages.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Message } from '../entities/message.entity';

export class MessagePaginator extends Paginator<Message> {
  @ApiProperty({ type: [Message] })
  data: Message[];
}

export class GetMessagesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Search text in messages',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'id'],
    required: false,
    default: 'created_at'
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;
}