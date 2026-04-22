// analytics/dto/category-wise-product-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';

export class CategoryWiseProductResponseDto extends CoreEntity {
  @ApiProperty({
    description: 'Total revenue for category',
    example: 5000.0,
    required: false,
  })
  totalRevenue?: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    required: false,
  })
  category_name?: string;

  @ApiProperty({
    description: 'Shop name',
    example: 'Tech Store',
    required: false,
  })
  shop_name?: string;

  @ApiProperty({
    description: 'Product count in category',
    example: 25,
    required: false,
  })
  product_count?: number;
}
