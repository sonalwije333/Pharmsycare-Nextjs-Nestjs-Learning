// become-seller/dto/become-seller-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BecomeSeller } from '../entities/become-seller.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class BecomeSellerResponse {
  @ApiProperty({ type: BecomeSeller })
  data: BecomeSeller;
}

export class BecomeSellerMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: BecomeSeller, required: false })
  data?: BecomeSeller;
}
