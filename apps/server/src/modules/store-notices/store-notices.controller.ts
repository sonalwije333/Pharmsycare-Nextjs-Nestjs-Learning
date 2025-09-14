// src/modules/store-notices/store-notices.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoreNoticesService } from './store-notices.service';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import { GetStoreNoticesDto } from './dto/get-store-notices.dto';
import { StoreNotice } from './entities/store-notices.entity';

@ApiTags('store-notices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('store-notices')
export class StoreNoticesController {
    constructor(private readonly storeNoticesService: StoreNoticesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new store notice' })
    @ApiResponse({ status: 201, description: 'Store notice created successfully', type: StoreNotice })
    create(@Body() createStoreNoticeDto: CreateStoreNoticeDto, @Request() req) {
        return this.storeNoticesService.create(createStoreNoticeDto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Get all store notices' })
    @ApiResponse({ status: 200, description: 'List of store notices' })
    getStoreNotices(@Query() query: GetStoreNoticesDto) {
        return this.storeNoticesService.getStoreNotices(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific store notice' })
    @ApiResponse({ status: 200, description: 'Store notice found', type: StoreNotice })
    @ApiResponse({ status: 404, description: 'Store notice not found' })
    getStoreNotice(@Param('id') id: string) {
        return this.storeNoticesService.getStoreNotice(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a store notice' })
    @ApiResponse({ status: 200, description: 'Store notice updated successfully', type: StoreNotice })
    @ApiResponse({ status: 404, description: 'Store notice not found' })
    update(@Param('id') id: string, @Body() updateStoreNoticeDto: UpdateStoreNoticeDto) {
        return this.storeNoticesService.update(+id, updateStoreNoticeDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a store notice' })
    @ApiResponse({ status: 200, description: 'Store notice deleted successfully' })
    @ApiResponse({ status: 404, description: 'Store notice not found' })
    deleteStoreNotice(@Param('id') id: string) {
        return this.storeNoticesService.remove(+id);
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark a store notice as read' })
    @ApiResponse({ status: 200, description: 'Store notice marked as read', type: StoreNotice })
    @ApiResponse({ status: 404, description: 'Store notice not found' })
    markAsRead(@Param('id') id: string, @Request() req) {
        return this.storeNoticesService.markAsRead(+id, req.user.id);
    }
}