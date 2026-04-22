// newsletters/dto/create-new-subscriber.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewSubscriberDto {
  @ApiProperty({
    description: 'Email address for newsletter subscription',
    example: 'user@example.com',
    format: 'email',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}