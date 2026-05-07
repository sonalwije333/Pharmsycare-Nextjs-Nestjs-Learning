import { PartialType } from '@nestjs/swagger';
import { CreateBecomeSellerDto } from './create-become-seller.dto';

export class UpdateBecomeSellerDto extends PartialType(CreateBecomeSellerDto) {}