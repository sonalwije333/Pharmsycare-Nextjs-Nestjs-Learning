// tags/dto/get-tags.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Tag } from '../entities/tag.entity';
import { IsOptional, IsString } from 'class-validator';

export class TagPaginator extends Paginator<Tag> {
  @ApiProperty({ type: [Tag] })
  data: Tag[];
}

export class GetTagsDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search text in name',
    required: false
  })
  text?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by name',
    required: false
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by hasType',
    required: false
  })
  hasType?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by language',
    example: 'en',
    required: false
  })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search with field:value pairs separated by semicolon',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
    default: 'and'
  })
  searchJoin?: string;
}

export enum QueryTagsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}