// src/modules/social/social.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { Social } from './entities/social.entity';
import { Profile } from '../users/entities/profile.entity';

@Injectable()
export class SocialService {
    constructor(
        @InjectRepository(Social)
        private readonly socialRepository: Repository<Social>,
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) {}

    async create(createSocialDto: CreateSocialDto): Promise<Social> {
        const profile = await this.profileRepository.findOne({
            where: { id: createSocialDto.profileId }
        });

        if (!profile) {
            throw new NotFoundException(`Profile with ID ${createSocialDto.profileId} not found`);
        }

        // Check if social link already exists for this profile
        const existingSocial = await this.socialRepository.findOne({
            where: {
                profile: { id: createSocialDto.profileId },
                type: createSocialDto.type
            }
        });

        if (existingSocial) {
            throw new ConflictException(`Social link of type ${createSocialDto.type} already exists for this profile`);
        }

        const social = this.socialRepository.create({
            type: createSocialDto.type,
            link: createSocialDto.link,
            profile: profile,
        });

        return await this.socialRepository.save(social);
    }

    async findAll(): Promise<Social[]> {
        return await this.socialRepository.find({
            relations: ['profile'],
        });
    }

    async findOne(id: number): Promise<Social> {
        const social = await this.socialRepository.findOne({
            where: { id },
            relations: ['profile'],
        });

        if (!social) {
            throw new NotFoundException(`Social with ID ${id} not found`);
        }

        return social;
    }

    async findByProfileId(profileId: number): Promise<Social[]> {
        return await this.socialRepository.find({
            where: { profile: { id: profileId } },
            relations: ['profile'],
        });
    }

    async update(id: number, updateSocialDto: UpdateSocialDto): Promise<Social> {
        const social = await this.socialRepository.findOne({
            where: { id },
            relations: ['profile'],
        });

        if (!social) {
            throw new NotFoundException(`Social with ID ${id} not found`);
        }

        if (updateSocialDto.profileId && updateSocialDto.profileId !== social.profile.id) {
            const profile = await this.profileRepository.findOne({
                where: { id: updateSocialDto.profileId }
            });

            if (!profile) {
                throw new NotFoundException(`Profile with ID ${updateSocialDto.profileId} not found`);
            }
            social.profile = profile;
        }

        if (updateSocialDto.type) {
            social.type = updateSocialDto.type;
        }

        if (updateSocialDto.link) {
            social.link = updateSocialDto.link;
        }

        return await this.socialRepository.save(social);
    }

    async remove(id: number): Promise<void> {
        const social = await this.socialRepository.findOne({
            where: { id }
        });

        if (!social) {
            throw new NotFoundException(`Social with ID ${id} not found`);
        }

        await this.socialRepository.remove(social);
    }
}