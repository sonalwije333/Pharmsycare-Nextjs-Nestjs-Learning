import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
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
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { PermissionType } from '../../common/enums/enums';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {Attribute} from "./entities/attribute.entity";
import {CreateAttributeDto} from "./dto/create-attribute.dto";
import {AttributePaginator, GetAttributesDto} from "./dto/get-attributes.dto";
import {GetAttributeArgs} from "./dto/get-attribute.dto";
import {UpdateAttributeDto} from "./dto/update-attribute.dto";
import { AttributesService } from './attributes.service';

@ApiTags('Attributes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create attribute', description: 'Creates a new attribute with values' })
  @ApiResponse({ status: 201, description: 'Attribute created successfully', type: Attribute })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  async create(@Body() createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get all attributes', description: 'Retrieves a list of attributes with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Shop ID filter' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
  @ApiResponse({ status: 200, description: 'Attributes retrieved successfully', type: AttributePaginator })
  async findAll(@Query() query: GetAttributesDto): Promise<AttributePaginator> {
    return this.attributesService.findAll(query);
  }

  @Get('shop/:shopId')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get attributes by shop', description: 'Retrieves all attributes for a specific shop' })
  @ApiParam({ name: 'shopId', description: 'Shop ID', type: String })
  @ApiResponse({ status: 200, description: 'Attributes retrieved successfully', type: [Attribute] })
  async getByShop(@Param('shopId') shopId: string): Promise<Attribute[]> {
    return this.attributesService.getAttributesByShop(shopId);
  }

  @Get('language/:language')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get attributes by language', description: 'Retrieves all attributes for a specific language' })
  @ApiParam({ name: 'language', description: 'Language code', type: String })
  @ApiResponse({ status: 200, description: 'Attributes retrieved successfully', type: [Attribute] })
  async getByLanguage(@Param('language') language: string): Promise<Attribute[]> {
    return this.attributesService.getAttributesByLanguage(language);
  }

  @Get(':param')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
  @ApiOperation({ summary: 'Get attribute by ID or slug', description: 'Retrieves a specific attribute by ID or slug' })
  @ApiParam({ name: 'param', description: 'Attribute ID or slug', type: String })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Language filter' })
  @ApiResponse({ status: 200, description: 'Attribute retrieved successfully', type: Attribute })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  async findOne(
    @Param('param') param: string,
    @Query() query: GetAttributeArgs,
  ): Promise<Attribute> {
    const args: GetAttributeArgs = { ...query };

    // Determine if param is ID or slug
    if (!isNaN(Number(param))) {
      args.id = Number(param);
    } else {
      args.slug = param;
    }

    return this.attributesService.findOne(args);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Update attribute', description: 'Updates an existing attribute and its values' })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiResponse({ status: 200, description: 'Attribute updated successfully', type: Attribute })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attribute', description: 'Permanently deletes an attribute and its values' })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiResponse({ status: 204, description: 'Attribute deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attribute not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attributesService.remove(id);
  }
}