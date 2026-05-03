import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ModelType } from 'src/common/enums/model-type.enum';


export class CreateFeedBackDto {
  @ApiProperty({
    description: 'Model ID (e.g., product ID, order ID)',
    example: '123',
    type: String,
  })
  @IsString()
  model_id: string;

  @ApiProperty({
    description: 'Model type (e.g., product, order)',
    example: ModelType.PRODUCT,
    enum: ModelType,
  })
  @IsEnum(ModelType)
  model_type: ModelType;

  @ApiProperty({
    description: 'Positive feedback',
    example: true,
    required: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  positive?: boolean;

  @ApiProperty({
    description: 'Negative feedback',
    example: false,
    required: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  negative?: boolean;

  @ApiProperty({
    description: 'User ID',
    example: '123',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  user_id?: string;
}