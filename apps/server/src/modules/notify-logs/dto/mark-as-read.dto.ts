import { ApiProperty } from '@nestjs/swagger';
import {IsNotEmpty, IsArray, IsOptional, IsString, IsNumber} from 'class-validator';

export class MarkAsReadDto {
    @ApiProperty({
        description: 'Notification IDs to mark as read',
        example: [1, 2, 3],
        required: false
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    ids?: number[];

    @ApiProperty({
        description: 'Mark all notifications as read for receiver',
        example: 'user-123',
        required: false
    })
    @IsOptional()
    @IsString()
    receiver?: string;
}