// users/dto/get-users.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { User } from '../entities/user.entity';

export class UserPaginator extends Paginator<User> {
  @ApiProperty({ type: [User] })
  data: User[];
}

export class GetUsersDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['name', 'created_at', 'updated_at', 'is_active'],
    required: false,
  })
  @IsOptional()
  @IsIn(['name', 'created_at', 'updated_at', 'is_active'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text',
    required: false,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'Name filter (alias of text)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Search with field:value pairs separated by semicolon',
    example: 'is_active:true;permissions:customer',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
  })
  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({
    description: 'Relations to include (comma-separated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  with?: string;
}

export enum QueryUsersOrderByColumn {
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  IS_ACTIVE = 'is_active',
}
