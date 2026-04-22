// tags/tags.controller.ts
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto, TagPaginator } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new tag',
    description: 'Creates a new tag (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Tag created successfully',
    type: Tag
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateTagDto })
  create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all tags',
    description: 'Retrieve paginated list of all tags with filtering options'
  })
  @ApiOkResponse({
    description: 'Tags retrieved successfully',
    type: TagPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'searchJoin', required: false, enum: ['and', 'or'], description: 'How to join search conditions' })
  @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'sortedBy', required: false, type: String, description: 'Sort direction' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name' })
  @ApiQuery({ name: 'hasType', required: false, type: String, description: 'Filter by has type' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Filter by language' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('searchJoin') searchJoin?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortedBy') sortedBy?: string,
    @Query('name') name?: string,
    @Query('hasType') hasType?: string,
    @Query('language') language?: string,
  ): Promise<TagPaginator> {
    return this.tagsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      searchJoin,
      orderBy,
      sortedBy,
      name,
      hasType,
      language,
    } as GetTagsDto);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get tag by ID or slug',
    description: 'Retrieve a specific tag by ID or slug'
  })
  @ApiParam({
    name: 'param',
    description: 'Tag ID or slug',
    example: 'electronics or 1'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language code for translated content',
    example: 'en'
  })
  @ApiOkResponse({
    description: 'Tag retrieved successfully',
    type: Tag
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  findOne(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<Tag> {
    return this.tagsService.findOne(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update tag',
    description: 'Update an existing tag by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Tag ID', type: Number })
  @ApiOkResponse({
    description: 'Tag updated successfully',
    type: Tag
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateTagDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto
  ): Promise<Tag> {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete tag',
    description: 'Permanently delete a tag (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Tag ID', type: Number })
  @ApiOkResponse({
    description: 'Tag deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.tagsService.remove(id);
  }
}