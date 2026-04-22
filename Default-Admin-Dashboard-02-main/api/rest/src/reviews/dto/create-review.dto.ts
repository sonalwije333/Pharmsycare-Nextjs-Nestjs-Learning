// reviews/dto/create-review.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Attachment } from 'src/common/entities/attachment.entity';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Review rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Excellent product, highly recommended!',
    required: false
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'Review photos',
    type: [Attachment],
    required: false
  })
  @IsArray()
  @IsOptional()
  photos?: Attachment[];

  @ApiProperty({
    description: 'Product ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  // @ApiProperty({
  //   description: 'Shop ID',
  //   example: 1,
  //   required: false
  // })
  // @IsNumber()
  // @IsOptional()
  // shop_id?: number;

  @ApiProperty({
    description: 'Order ID',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  order_id?: number;

  @ApiProperty({
    description: 'Variation option ID',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  variation_option_id?: number;
}