// src/modules/messages/dto/get-messages.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Message } from '../entities/message.entity';


export class MessagesPaginator extends Paginator<Message> {}

export class GetMessagesDto extends PaginationArgs {
  @ApiPropertyOptional({ description: 'Conversation ID', example: 1 })
  @IsOptional()
  @IsNumber()
  conversation_id?: number;

  @ApiPropertyOptional({ description: 'User ID', example: 'user-123' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Search query', example: 'hello' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Order by column', example: 'created_at' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  // REMOVED: sortedBy is already defined in PaginationArgs
  // @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder })
  // @IsOptional()
  // @IsEnum(SortOrder)
  // sortedBy?: SortOrder;

  @ApiPropertyOptional({ description: 'Is read filter', example: true })
  @IsOptional()
  @IsString()
  is_read?: string;
}