import { ApiProperty } from '@nestjs/swagger';
import { BecomeSeller } from '../entities/become-seller.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class BecomeSellerResponse {
  @ApiProperty({ type: () => BecomeSeller, description: 'Become seller configuration data' })
  data: BecomeSeller;
}

export class BecomeSellerMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: () => BecomeSeller, required: false, description: 'Updated become seller configuration' })
  data?: BecomeSeller;
}