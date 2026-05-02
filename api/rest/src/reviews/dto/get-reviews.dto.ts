// reviews/dto/get-reviews.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Review } from '../entities/review.entity';

export class ReviewPaginator extends Paginator<Review> {
  @ApiProperty({ type: [Review] })
  data: Review[];
}

export class GetReviewsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['NAME', 'CREATED_AT', 'UPDATED_AT', 'RATING'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in comment',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by product ID',
    required: false
  })
  product_id?: number;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false
  })
  user_id?: number;

  @ApiProperty({
    description: 'Filter by rating',
    minimum: 1,
    maximum: 5,
    required: false
  })
  rating?: number;

  // @ApiProperty({
  //   description: 'Filter by shop ID',
  //   required: false
  // })
  // shop_id?: number;
}

export enum QueryReviewsOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  RATING = 'RATING',
}