// attributes/dto/get-attributes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryAttributesOrderByColumn } from '../../common/enums/enums';

export class QueryAttributesOrderByOrderByClause {
  @ApiProperty({
    enum: QueryAttributesOrderByColumn,
    example: QueryAttributesOrderByColumn.NAME,
  })
  column: QueryAttributesOrderByColumn;

  @ApiProperty({
    enum: SortOrder,
    example: SortOrder.ASC,
  })
  order: SortOrder;
}

export class GetAttributesArgs {
  @ApiProperty({
    type: [QueryAttributesOrderByOrderByClause],
    required: false,
    description: 'Order by clauses',
  })
  orderBy?: QueryAttributesOrderByOrderByClause[];

  @ApiProperty({
    description: 'Filter by shop ID',
    example: 1,
    required: false,
  })
  shop_id?: number;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    default: 'en',
  })
  language?: string;
}
