// flash-sale/dto/flash-sale-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { FlashSale } from '../entities/flash-sale.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class FlashSaleResponse {
  @ApiProperty({ type: FlashSale })
  flashSale: FlashSale;
}

export class FlashSaleMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: FlashSale, required: false })
  flashSale?: FlashSale;
}
