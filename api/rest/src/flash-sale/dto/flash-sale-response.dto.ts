import { ApiProperty } from '@nestjs/swagger';
import { FlashSale } from '../entities/flash-sale.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class FlashSaleResponse {
  @ApiProperty({ type: () => FlashSale, description: 'Flash sale data' })
  flashSale: FlashSale;
}

export class FlashSaleMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: () => FlashSale, required: false, description: 'Updated flash sale data' })
  flashSale?: FlashSale;
}