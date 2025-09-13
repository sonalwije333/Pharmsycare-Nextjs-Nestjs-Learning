import { ApiProperty } from '@nestjs/swagger';
import {Shop} from "../entites/shop.entity";
import {PaginatorInfo} from "../../common/dto/paginator-info.dto";

export class ShopPaginator {
    @ApiProperty({ type: [Shop], description: 'List of shops' })
    data: Shop[];

    @ApiProperty({ type: PaginatorInfo, description: 'Pagination information' })
    paginatorInfo: PaginatorInfo;
}