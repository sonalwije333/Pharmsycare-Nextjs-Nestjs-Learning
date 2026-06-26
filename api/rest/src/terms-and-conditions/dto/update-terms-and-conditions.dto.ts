// terms-and-conditions/dto/update-terms-and-conditions.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTermsAndConditionsDto } from './create-terms-and-conditions.dto';

export class UpdateTermsAndConditionsDto extends PartialType(CreateTermsAndConditionsDto) {}