import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetPaymentMethodsDto {
  @ApiPropertyOptional({ description: 'Search text', example: 'visa' })
  @IsOptional()
  @IsString()
  text?: string;
}