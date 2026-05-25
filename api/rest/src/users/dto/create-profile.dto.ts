// users/dto/create-profile.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Profile } from '../entities/profile.entity';
import { ConnectBelongsTo } from './connect-belongs-to.dto';

export class CreateProfileDto extends PickType(Profile, [
  'avatar',
  'bio',
  'socials',
  'contact',
] as const) {
  @ApiProperty({
    description: 'Customer connection',
    type: ConnectBelongsTo
  })
  @IsObject()
  @IsNotEmpty()
  customer: ConnectBelongsTo;
}

export class UpdateProfileDto extends PickType(Profile, [
  'avatar',
  'bio',
  'socials',
  'contact',
] as const) {
  @ApiProperty({
    description: 'Customer connection',
    type: ConnectBelongsTo,
    required: false
  })
  @IsObject()
  @IsOptional()
  customer?: ConnectBelongsTo;
}