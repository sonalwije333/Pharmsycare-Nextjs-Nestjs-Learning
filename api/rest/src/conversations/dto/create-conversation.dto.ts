import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ 
    description: 'User ID', 
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  user_id: number;

  @ApiProperty({ 
    description: 'Shop ID', 
    example: 7,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  shop_id: number;

  @ApiProperty({
    description: 'Initial message',
    example: 'Hello, I have a question',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  message?: string;
}