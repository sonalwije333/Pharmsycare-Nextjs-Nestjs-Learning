// feedbacks/dto/update-feedback.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFeedBackDto } from './create-feedback.dto';

export class UpdateFeedBackDto extends PartialType(CreateFeedBackDto) {}
