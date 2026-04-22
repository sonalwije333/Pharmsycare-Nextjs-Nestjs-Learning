// uploads/dto/upload-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'Uploaded file ID', example: '883' })
  id: string;

  @ApiProperty({ description: 'Original file URL', example: 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/image.png' })
  original: string;

  @ApiProperty({ description: 'Thumbnail URL', example: 'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/image-thumbnail.jpg' })
  thumbnail: string;
}

export class UploadsResponseDto {
  @ApiProperty({ type: [UploadResponseDto] })
  data: UploadResponseDto[];
}

export class UploadPaginatorDto {
  @ApiProperty({ type: [UploadResponseDto] })
  data: UploadResponseDto[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 10 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;
}