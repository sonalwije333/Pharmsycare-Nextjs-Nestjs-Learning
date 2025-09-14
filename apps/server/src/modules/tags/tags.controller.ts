import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Tag } from './entities/tag.entity';

@ApiTags('Tags')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new tag', description: 'Creates a new tag. Requires appropriate permissions.' })
    @ApiResponse({ status: 201, description: 'Tag successfully created', type: Tag })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createTag(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all tags', description: 'Retrieves a list of tags with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search text' })
    @ApiQuery({ name: 'text', required: false, type: String, description: 'Search text' })
    @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name' })
    @ApiQuery({ name: 'hasType', required: false, enum: ['true', 'false'], description: 'Filter by whether tag has type' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Filter by language' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'], description: 'Field to order by' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Tags retrieved successfully', type: TagPaginator })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    getTags(@Query() query: GetTagsDto) {
        return this.tagsService.findAll(query);
    }

    @Get(':param')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get tag by ID or slug', description: 'Retrieves a specific tag by its ID or slug.' })
    @ApiParam({ name: 'param', description: 'Tag ID or slug' })
    @ApiQuery({ name: 'language', required: false, type: String, description: 'Language code' })
    @ApiResponse({ status: 200, description: 'Tag retrieved successfully', type: Tag })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    getTag(@Param('param') param: string, @Query('language') language: string) {
        return this.tagsService.findOne(param, language);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update tag', description: 'Updates an existing tag.' })
    @ApiParam({ name: 'id', description: 'Tag ID', type: Number })
    @ApiResponse({ status: 200, description: 'Tag updated successfully', type: Tag })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    updateTag(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.update(id, updateTagDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete tag', description: 'Permanently deletes a tag. Requires admin privileges.' })
    @ApiParam({ name: 'id', description: 'Tag ID', type: Number })
    @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    deleteTag(@Param('id', ParseIntPipe) id: number) {
        return this.tagsService.remove(id);
    }
}