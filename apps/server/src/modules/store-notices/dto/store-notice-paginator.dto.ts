// src/modules/store-notices/dto/store-notice-paginator.dto.ts
import { Paginator } from "../../common/dto/paginator.dto";
import { StoreNotice } from "../entities/store-notices.entity";
import { ApiProperty } from '@nestjs/swagger';

export class StoreNoticePaginator extends Paginator<StoreNotice> {
    @ApiProperty({ type: [StoreNotice] })
    declare data: StoreNotice[]; // Add 'declare' modifier
}