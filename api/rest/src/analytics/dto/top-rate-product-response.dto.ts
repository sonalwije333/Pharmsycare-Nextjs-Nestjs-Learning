import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

export class TopRateProductResponseDto extends CoreEntity {
  @ApiProperty({ required: false, type: Number, description: 'Product ID', example: 1 })
  product_id?: number;

  @ApiProperty({ required: false, type: String, description: 'Product name', example: 'Wireless Mouse' })
  name?: string;

  @ApiProperty({ required: false, type: String, description: 'Product slug', example: 'wireless-mouse' })
  slug?: string;

  @ApiProperty({ required: false, type: Number, description: 'Regular price', example: 49.99 })
  regular_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Sale price', example: 39.99 })
  sale_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Minimum price', example: 39.99 })
  min_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Maximum price', example: 49.99 })
  max_price?: number;

  @ApiProperty({ required: false, type: String, description: 'Product type', example: 'simple' })
  product_type?: string;

  @ApiProperty({ required: false, type: String, description: 'Product description' })
  description?: string;

  @ApiProperty({ required: false, type: Number, description: 'Type ID', example: 1 })
  type_id?: number;

  @ApiProperty({ required: false, type: String, description: 'Type slug', example: 'electronics' })
  type_slug?: string;

  @ApiProperty({ required: false, type: Number, description: 'Total rating', example: 4.5 })
  total_rating?: number;

  @ApiProperty({ required: false, type: Number, description: 'Rating count', example: 128 })
  rating_count?: number;

  @ApiProperty({ required: false, type: Number, description: 'Actual rating', example: 4.5 })
  actual_rating?: number;

  @ApiProperty({ type: () => Attachment, required: false, description: 'Product image' })
  image?: Attachment;
}