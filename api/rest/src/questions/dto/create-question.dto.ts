// src/questions/dto/create-question.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Question } from '../entities/question.entity';

export class CreateQuestionDto extends OmitType(Question, [
  'id',
  'product',
  'user',
  // 'shop',
  'created_at',
  'updated_at',
  'deleted_at',
  'positive_feedbacks_count',
  'negative_feedbacks_count',
  'abusive_reports_count',
  'answer',
  'my_feedback',
]) {
  @ApiProperty({
    description: 'User ID asking the question',
    example: 2,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'Product ID the question is about',
    example: 470,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({
    description: 'Shop ID',
    example: 5,
    required: true
  })
  // @IsNumber()
  // @IsNotEmpty()
  // shop_id: number;

  @ApiProperty({
    description: 'Question text',
    example: 'Is it sweet or sour?',
    minLength: 3,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  question: string;
}