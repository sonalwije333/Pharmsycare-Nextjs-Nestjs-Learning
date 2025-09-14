import { PartialType } from '@nestjs/swagger';
import { CreateTermsAndConditionsDto } from './create-terms-and-conditions.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTermsAndConditionsDto extends PartialType(
    CreateTermsAndConditionsDto,
) {
    @ApiPropertyOptional({ description: 'Is approved', example: true })
    @IsOptional()
    @IsBoolean()
    is_approved?: boolean;
}