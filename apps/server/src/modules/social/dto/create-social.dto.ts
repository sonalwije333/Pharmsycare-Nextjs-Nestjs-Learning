// src/modules/social/dto/create-social.dto.ts
import { IsString, IsUrl, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocialDto {
    @ApiProperty({ example: 'twitter', description: 'Social media platform type' })
    @IsString()
    type: string;

    @ApiProperty({ example: 'https://twitter.com/username', description: 'Social media profile URL' })
    @IsUrl()
    link: string;

    @ApiProperty({ example: 1, description: 'Profile ID this social belongs to' })
    @IsNumber()
    profileId: number;
}