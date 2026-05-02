// shops/dto/get-staffs.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';

export class GetStaffsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['name', 'email', 'created_at'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Shop ID to filter staff',
    example: 1,
    required: true
  })
  shop_id?: number;
}