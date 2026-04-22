import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AddWalletPointsDto {
  @Type(() => Number)
  @IsInt()
  customer_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  points: number;
}
