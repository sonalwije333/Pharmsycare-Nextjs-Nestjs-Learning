import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';

export class CategoryWiseProductResponseDto extends CoreEntity {
  @ApiProperty({
    description: 'Total revenue for category',
    example: 5000.0,
    required: false,
    type: Number,
  })
  totalRevenue?: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    required: false,
    type: String,
  })
  category_name?: string;

  @ApiProperty({
    description: 'Shop name',
    example: 'Tech Store',
    required: false,
    type: String,
  })
  shop_name?: string;

  @ApiProperty({
    description: 'Product count in category',
    example: 25,
    required: false,
    type: Number,
  })
  product_count?: number;
}