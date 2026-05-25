// authors/dto/update-author.dto.ts
import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateAuthorDto } from './create-author.dto';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	slug?: string;
}
