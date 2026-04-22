// analytics/dto/top-rate-product-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

export class TopRateProductResponseDto extends CoreEntity {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  slug?: string;

  @ApiProperty({ required: false })
  regular_price?: number;

  @ApiProperty({ required: false })
  sale_price?: number;

  @ApiProperty({ required: false })
  min_price?: number;

  @ApiProperty({ required: false })
  max_price?: number;

  @ApiProperty({ required: false })
  product_type?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  type_id?: number;

  @ApiProperty({ required: false })
  type_slug?: string;

  @ApiProperty({ required: false })
  total_rating?: number;

  @ApiProperty({ required: false })
  rating_count?: number;

  @ApiProperty({ required: false })
  actual_rating?: number;

  @ApiProperty({ type: Attachment, required: false })
  image?: Attachment;
}
