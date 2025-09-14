// src/modules/social/social.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { Social } from './entities/social.entity';
import { Profile } from '../users/entities/profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Social, Profile])],
    controllers: [SocialController],
    providers: [SocialService],
    exports: [SocialService],
})
export class SocialModule {}