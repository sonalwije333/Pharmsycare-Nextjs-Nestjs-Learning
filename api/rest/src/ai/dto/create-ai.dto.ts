// ai/dto/create-ai.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiDto {
  @ApiProperty({
    description: 'Prompt for AI description generation',
    example: 'Generate a product description for a wireless mouse',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
