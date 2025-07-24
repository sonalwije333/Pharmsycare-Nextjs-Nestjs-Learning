import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Manufacturer } from '../entities/manufacturer.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateManufacturerDto{
    @IsNotEmpty()
    @ApiProperty({ description: 'Manufacturer name', example: 'Manu abv' })
    name: string;
  
    @IsNotEmpty()
    @ApiProperty({ description: 'Manufacturer slug', example: 'manu-abc' })
    slug: string;
}
