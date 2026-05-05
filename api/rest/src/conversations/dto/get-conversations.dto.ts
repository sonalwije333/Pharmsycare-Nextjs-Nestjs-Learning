import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { ConversationOrderByColumn } from 'src/common/enums/conversation-order-by.enum';
import { Conversation } from '../entities/conversation.entity';


export class ConversationPaginator {
  @ApiProperty({ type: () => [Conversation] })
  data: Conversation[];

  @ApiProperty({ example: 1, type: Number })
  current_page: number;

  @ApiProperty({ example: 30, type: Number })
  per_page: number;

  @ApiProperty({ example: 100, type: Number })
  total: number;

  @ApiProperty({ example: 10, type: Number })
  last_page: number;

  @ApiProperty({ example: '/conversations?page=1', type: String })
  first_page_url: string;

  @ApiProperty({ example: '/conversations?page=10', type: String })
  last_page_url: string;

  @ApiProperty({ example: '/conversations?page=2', nullable: true, type: String })
  next_page_url: string | null;

  @ApiProperty({ example: '/conversations?page=1', nullable: true, type: String })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number })
  from: number;

  @ApiProperty({ example: 30, type: Number })
  to: number;
}

export class GetConversationsDto extends PaginationArgs {
  @ApiProperty({ 
    enum: ConversationOrderByColumn, 
    required: false, 
    default: ConversationOrderByColumn.UPDATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(ConversationOrderByColumn)
  orderBy?: ConversationOrderByColumn = ConversationOrderByColumn.UPDATED_AT;

  @ApiProperty({ 
    enum: SortOrder, 
    required: false, 
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({ 
    required: false, 
    type: String,
    description: 'Search term',
    example: 'question',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Filter by user ID',
    example: 6,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  user_id?: number;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Filter by shop ID',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shop_id?: number;

  @ApiProperty({ 
    required: false, 
    type: Boolean,
    description: 'Filter by unseen status',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unseen?: boolean;
}
