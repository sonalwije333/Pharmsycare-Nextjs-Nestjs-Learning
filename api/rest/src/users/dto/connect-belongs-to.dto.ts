// users/dto/connect-belongs-to.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class ConnectBelongsTo {
  @ApiProperty({
    description: 'ID to connect',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  connect: number;
}