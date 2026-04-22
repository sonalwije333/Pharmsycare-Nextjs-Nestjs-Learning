// src/questions/dto/update-question.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiProperty({
    description: 'Answer text',
    example: 'Yes, it is available in multiple colors.',
    required: false
  })
  @IsString()
  @IsOptional()
  answer?: string;
}

export class UpdateQuestionAnswerDto {
  @ApiProperty({
    description: 'Answer text',
    example: 'Yes, it is available in multiple colors.',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  answer: string;
}