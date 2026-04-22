// shops/dto/get-staffs.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';

export class GetStaffsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['name', 'email', 'created_at'],
    required: false
  })
  @IsOptional()
  @IsIn(['name', 'email', 'created_at'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Shop ID to filter staff',
    example: 1,
    required: true
  })
  @Type(() => Number)
  @IsNumber()
  shop_id?: number;
}