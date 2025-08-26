// src/modules/users/dto/get-users.dto.ts
import { Paginator } from '../../common/dto/paginator.dto';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../entities/user.entity';
import { QueryUsersOrderByColumn } from '../../../common/enums/enums';

export class UserPaginator extends Paginator<User> {
  // Remove redundant data declaration - it's inherited from Paginator<User>
}

export class GetUsersDto extends PaginationArgs {
  @IsOptional()
  @IsEnum(QueryUsersOrderByColumn)
  orderBy?: QueryUsersOrderByColumn;

  // Remove redundant sortedBy declaration - it's inherited from PaginationArgs

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
