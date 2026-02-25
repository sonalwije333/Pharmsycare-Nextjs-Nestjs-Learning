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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributesDto, AttributePaginator } from './dto/get-attributes.dto';
import { GetAttributeArgs } from './dto/get-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new attribute',
    description:
      'Creates a new attribute with values. Requires admin or store owner privileges.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute successfully created',
    type: Attribute,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all attributes',
    description:
      'Retrieves a list of attributes with pagination and filtering.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'shop_id',
    required: false,
    type: Number,
    description: 'Shop ID filter',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'],
  })
  @ApiQuery({ name: 'sortedBy', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attributes retrieved successfully',
    type: AttributePaginator,
  })
  findAll(@Query() query: GetAttributesDto) {
    return this.attributesService.findAll(query);
  }

  @Get(':param')
  @ApiOperation({
    summary: 'Get attribute by ID or slug',
    description: 'Retrieves a specific attribute by its ID or slug.',
  })
  @ApiParam({
    name: 'param',
    description: 'Attribute ID or slug',
    type: String,
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language filter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute retrieved successfully',
    type: Attribute,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  findOne(@Param('param') param: string, @Query('language') language?: string) {
    const args: GetAttributeArgs = {};

    // Determine if param is ID or slug
    if (!isNaN(Number(param))) {
      args.id = Number(param);
    } else {
      args.slug = param;
    }

    if (language) {
      args.language = language;
    }

    return this.attributesService.findOne(args);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update an attribute',
    description:
      'Updates an existing attribute. Requires admin or store owner privileges.',
  })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attribute updated successfully',
    type: Attribute,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an attribute',
    description:
      'Permanently deletes an attribute. Requires admin or store owner privileges.',
  })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attribute deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attribute not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributesService.remove(id);
  }
}
