import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe, UseGuards, // Added ParseIntPipe
} from '@nestjs/common';
import { TermsAndConditionsService } from './terms-and-conditions.service';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';

import { GetTermsAndConditionsDto, TermsAndConditionsPaginator } from './dto/get-terms-and-conditions.dto';
import {ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiBearerAuth} from '@nestjs/swagger';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {RolesGuard} from "../../common/guards/auth/auth.guard";
import {UpdateTermsAndConditionsDto} from "./dto/update-terms-and-conditions.dto";

@ApiTags('Terms and Conditions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/terms-and-conditions')
export class TermsAndConditionsController {
    constructor(
        private readonly termsAndConditionsService: TermsAndConditionsService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create new terms and conditions' })
    @ApiResponse({
        status: 201,
        description: 'Terms and conditions created successfully',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createTermsAndConditionsDto: CreateTermsAndConditionsDto) {
        return this.termsAndConditionsService.create(createTermsAndConditionsDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all terms and conditions with pagination' })
    @ApiResponse({
        status: 200,
        description: 'List of terms and conditions',
        type: TermsAndConditionsPaginator
    })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'type', required: false, type: String })
    @ApiQuery({ name: 'issued_by', required: false, type: String })
    @ApiQuery({ name: 'is_approved', required: false, type: Boolean })
    @ApiQuery({ name: 'language', required: false, type: String })
    @ApiQuery({ name: 'shop_id', required: false, type: Number })
    @ApiQuery({ name: 'user_id', required: false, type: String })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'TITLE', 'UPDATED_AT', 'IS_APPROVED'] })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
    findAll(@Query() query: GetTermsAndConditionsDto) {
        return this.termsAndConditionsService.getTermsPaginated(query);
    }

    @Get('all')
    @ApiOperation({ summary: 'Get all terms and conditions without pagination' })
    @ApiResponse({
        status: 200,
        description: 'List of all terms and conditions',
        type: [TermsAndConditions]
    })
    @ApiQuery({ name: 'language', required: false, type: String })
    getAllTerms(@Query('language') language?: string) {
        return this.termsAndConditionsService.getAllTerms(language);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get terms and conditions by ID' })
    @ApiResponse({
        status: 200,
        description: 'Terms and conditions details',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'id', description: 'Terms and conditions ID', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) { // Added ParseIntPipe
        return this.termsAndConditionsService.findOne(id);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get terms and conditions by slug' })
    @ApiResponse({
        status: 200,
        description: 'Terms and conditions details',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'slug', description: 'Terms and conditions slug', type: String })
    findBySlug(@Param('slug') slug: string) {
        return this.termsAndConditionsService.findBySlug(slug);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update terms and conditions by ID' })
    @ApiResponse({
        status: 200,
        description: 'Terms and conditions updated successfully',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'id', description: 'Terms and conditions ID', type: Number })
    update(
        @Param('id', ParseIntPipe) id: number, // Added ParseIntPipe
        @Body() updateTermsAndConditionsDto: UpdateTermsAndConditionsDto,
    ) {
        return this.termsAndConditionsService.update(id, updateTermsAndConditionsDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete terms and conditions by ID' })
    @ApiResponse({ status: 204, description: 'Terms and conditions deleted successfully' })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'id', description: 'Terms and conditions ID', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) { // Added ParseIntPipe
        return this.termsAndConditionsService.remove(id);
    }

    @Put(':id/approve')
    @ApiOperation({ summary: 'Approve terms and conditions by ID' })
    @ApiResponse({
        status: 200,
        description: 'Terms and conditions approved successfully',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'id', description: 'Terms and conditions ID', type: Number })
    approve(@Param('id', ParseIntPipe) id: number) { // Added ParseIntPipe
        return this.termsAndConditionsService.approve(id);
    }

    @Put(':id/disapprove')
    @ApiOperation({ summary: 'Disapprove terms and conditions by ID' })
    @ApiResponse({
        status: 200,
        description: 'Terms and conditions disapproved successfully',
        type: TermsAndConditions
    })
    @ApiResponse({ status: 404, description: 'Terms and conditions not found' })
    @ApiParam({ name: 'id', description: 'Terms and conditions ID', type: Number })
    disapprove(@Param('id', ParseIntPipe) id: number) { // Added ParseIntPipe
        return this.termsAndConditionsService.disapprove(id);
    }
}