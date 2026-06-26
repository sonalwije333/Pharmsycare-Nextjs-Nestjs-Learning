// uploads/dto/get-uploads.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';

export class GetUploadsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Search by filename',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by mime type',
    example: 'image/png',
    required: false
  })
  mimetype?: string;

  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'filename', 'size'],
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
}