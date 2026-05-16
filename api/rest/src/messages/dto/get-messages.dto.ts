import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SortOrder } from 'src/common/enums/enums';
import { Message } from '../entities/message.entity';
import { MessageOrderByColumn } from 'src/common/enums/message-order-by.enum';

export class MessagePaginator {
  @ApiProperty({ type: () => [Message], description: 'Array of messages' })
  data: Message[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/messages?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/messages?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/messages?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/messages?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetMessagesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Search text in messages',
    required: false,
    type: String,
    example: 'hello',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Order by column',
    enum: MessageOrderByColumn,
    required: false,
    default: MessageOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(MessageOrderByColumn)
  orderBy?: MessageOrderByColumn = MessageOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}