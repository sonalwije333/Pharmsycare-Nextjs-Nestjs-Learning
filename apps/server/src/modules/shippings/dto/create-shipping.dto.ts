import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsNumber, IsBoolean, IsEnum, IsOptional, IsString} from 'class-validator';
import { ShippingType} from "../../../common/enums/enums";

export class CreateShippingDto {
    @ApiProperty({ description: 'Shipping name', example: 'Standard Shipping' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Shipping amount', example: 10.99 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ description: 'Is global shipping', example: true })
    @IsNotEmpty()
    @IsBoolean()
    is_global: boolean;

    @ApiProperty({
        description: 'Shipping type',
        enum: ShippingType,
        example: ShippingType.FIXED
    })
    @IsNotEmpty()
    @IsEnum(ShippingType)
    type: ShippingType;
}