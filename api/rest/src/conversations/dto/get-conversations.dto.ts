// conversations/dto/get-conversations.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Conversation } from '../entities/conversation.entity';

export class ConversationPaginator {
  @ApiProperty({ type: [Conversation] })
  data: Conversation[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/conversations?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/conversations?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/conversations?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/conversations?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetConversationsDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortedBy?: SortOrder;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  user_id?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  shop_id?: number;
}
