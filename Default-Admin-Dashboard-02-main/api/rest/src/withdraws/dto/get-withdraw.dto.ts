// src/withdraws/dto/get-withdraw.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Withdraw } from '../entities/withdraw.entity';

export class WithdrawPaginator extends Paginator<Withdraw> {
  @ApiProperty({ type: [Withdraw] })
  data: Withdraw[];
}

export class GetWithdrawsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'amount', 'status', 'shop_id'],
    required: false,
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'amount', 'status', 'shop_id'])
  orderBy?: string = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value
  )
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortedBy?: string = 'DESC';

  @ApiProperty({
    description: 'Formatted search string',
    required: false,
    example: 'shop_id:3;status:Pending',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Search condition join type',
    enum: ['and', 'or'],
    required: false,
    default: 'and',
  })
  @IsOptional()
  @IsString()
  @IsIn(['and', 'or'])
  searchJoin?: string;

  @ApiProperty({
    description: 'Filter by withdrawal status',
    enum: ['Approved', 'Pending', 'On hold', 'Rejected', 'Processing'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Filter by shop ID',
    required: false,
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shop_id?: number;
}