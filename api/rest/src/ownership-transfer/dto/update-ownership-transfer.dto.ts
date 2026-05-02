// ownership-transfer/dto/update-ownership-transfer.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateOwnershipTransferDto } from './create-ownership-transfer.dto';

export class UpdateOwnershipTransferDto extends PartialType(CreateOwnershipTransferDto) {}