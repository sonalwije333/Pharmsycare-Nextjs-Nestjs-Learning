import { ApiProperty } from '@nestjs/swagger';
import { PaginatorInfo } from '../../common/dto/paginator-info.dto';
import { Shop } from '../entites/shop.entity';

export class ShopPaginator {
  @ApiProperty({ type: [Shop], description: 'List of shops' })
  data: Shop[];

  @ApiProperty({ type: PaginatorInfo, description: 'Pagination information' })
  paginatorInfo: PaginatorInfo;
}
