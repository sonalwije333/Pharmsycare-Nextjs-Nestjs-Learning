// src/modules/social/social.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Social } from './entities/social.entity';

@ApiTags('social')
@Controller('social')
export class SocialController {
    constructor(private readonly socialService: SocialService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new social link' })
    @ApiResponse({ status: 201, description: 'Social link created successfully', type: Social })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    @ApiResponse({ status: 409, description: 'Social link already exists for this profile' })
    create(@Body() createSocialDto: CreateSocialDto) {
        return this.socialService.create(createSocialDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all social links' })
    @ApiResponse({ status: 200, description: 'List of all social links', type: [Social] })
    findAll() {
        return this.socialService.findAll();
    }

    @Get('profile/:profileId')
    @ApiOperation({ summary: 'Get social links by profile ID' })
    @ApiResponse({ status: 200, description: 'List of social links for the profile', type: [Social] })
    findByProfile(@Param('profileId') profileId: string) {
        return this.socialService.findByProfileId(+profileId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific social link by ID' })
    @ApiResponse({ status: 200, description: 'Social link found', type: Social })
    @ApiResponse({ status: 404, description: 'Social link not found' })
    findOne(@Param('id') id: string) {
        return this.socialService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a social link' })
    @ApiResponse({ status: 200, description: 'Social link updated successfully', type: Social })
    @ApiResponse({ status: 404, description: 'Social link or profile not found' })
    update(@Param('id') id: string, @Body() updateSocialDto: UpdateSocialDto) {
        return this.socialService.update(+id, updateSocialDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a social link' })
    @ApiResponse({ status: 200, description: 'Social link deleted successfully' })
    @ApiResponse({ status: 404, description: 'Social link not found' })
    remove(@Param('id') id: string) {
        return this.socialService.remove(+id);
    }
}