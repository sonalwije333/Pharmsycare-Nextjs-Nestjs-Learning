// reviews/dto/get-reviews.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Review } from '../entities/review.entity';

export class ReviewPaginator extends Paginator<Review> {
  @ApiProperty({ type: [Review] })
  data: Review[];
}

export class GetReviewsDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['NAME', 'CREATED_AT', 'UPDATED_AT', 'RATING'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search text in comment',
    required: false
  })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by product ID',
    required: false
  })
  product_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by user ID',
    required: false
  })
  user_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by rating',
    minimum: 1,
    maximum: 5,
    required: false
  })
  rating?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Relation include list (e.g. product;user)',
    required: false,
  })
  with?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search join operator',
    enum: ['and', 'or'],
    required: false,
  })
  searchJoin?: string;

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