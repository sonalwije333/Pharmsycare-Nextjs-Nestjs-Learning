// src/modules/conversations/dto/get-conversations.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Conversation } from '../entities/conversation.entity';

export class ConversationPaginator extends Paginator<Conversation> {}

export class GetConversationsDto extends PaginationArgs {
  @ApiPropertyOptional({ description: 'Order by column', example: 'created_at' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: 'Search query', example: 'order' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Shop ID filter', example: '1' })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiPropertyOptional({ description: 'User ID filter', example: 'user-123' })
  @IsOptional()
  @IsString()
  user_id?: string;
}