import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { GetFaqsDto, FaqPaginator } from './dto/get-faqs.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Faq } from './entities/faq.entity';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('FAQs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/faqs')
export class FaqsController {
    constructor(private readonly faqsService: FaqsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new FAQ', description: 'Creates a new FAQ. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'FAQ successfully created', type: Faq })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createFaq(@Body() createFaqDto: CreateFaqDto) {
        return this.faqsService.create(createFaqDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all FAQs', description: 'Retrieves a list of FAQs with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiQuery({ name: 'faq_type', required: false, type: String, description: 'FAQ type filter' })
    @ApiQuery({ name: 'shop_id', required: false, type: String, description: 'Shop ID filter' })
    @ApiQuery({ name: 'issued_by', required: false, type: String, description: 'Issued by filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'FAQ_TITLE', 'FAQ_DESCRIPTION'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'FAQs retrieved successfully', type: FaqPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async findAll(@Query() query: GetFaqsDto): Promise<FaqPaginator> {
        return this.faqsService.findAllFaqs(query);
    }

    @Get(':param')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get FAQ by ID or slug', description: 'Retrieves a specific FAQ by ID or slug.' })
    @ApiParam({ name: 'param', description: 'FAQ ID or slug', type: String })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
    @ApiResponse({ status: 200, description: 'FAQ retrieved successfully', type: Faq })
    @ApiResponse({ status: 404, description: 'FAQ not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    async getFaq(
        @Param('param') param: string,
        @Query('language') language: string
    ): Promise<Faq> {
        return this.faqsService.getFaq(param, language);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update FAQ', description: 'Updates an existing FAQ.' })
    @ApiParam({ name: 'id', description: 'FAQ ID', type: Number })
    @ApiResponse({ status: 200, description: 'FAQ updated successfully', type: Faq })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'FAQ not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFaqDto: UpdateFaqDto,
    ) {
        return this.faqsService.update(id, updateFaqDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete FAQ', description: 'Soft deletes an FAQ. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'FAQ ID', type: Number })
    @ApiResponse({ status: 204, description: 'FAQ deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'FAQ not found' })
    async deleteFaq(@Param('id', ParseIntPipe) id: number) {
        return this.faqsService.remove(id);
    }
}