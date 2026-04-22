// uploads/dto/delete-upload.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteUploadDto {
  @ApiProperty({
    description: 'Array of file IDs to delete',
    type: [String],
    example: ['883', '884']
  })
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}