import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateAiDto {
  @ApiProperty({
    description: 'Prompt for AI description generation',
    example: 'Generate a product description for a wireless mouse',
    required: true,
    type: String,
    minLength: 3,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Prompt must be at least 3 characters long' })
  @MaxLength(500, { message: 'Prompt cannot exceed 500 characters' })
  prompt: string;
}