// attributes/attributes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { GetAttributesArgs } from './dto/get-attributes.dto';
import { Attribute } from './entities/attribute.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🏷️ Attributes')
@Controller('attributes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new attribute',
    description: 'Creates a new attribute with values (Admin/Store Owner only)',
  })
  @ApiCreatedResponse({
    description: 'Attribute created successfully',
    type: Attribute,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateAttributeDto })
  create(@Body() createAttributeDto: CreateAttributeDto): Promise<Attribute> {
    return this.attributesService.create(createAttributeDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all attributes',
    description: 'Retrieve all attributes with optional filtering (Public)',
  })
  @ApiOkResponse({
    description: 'Attributes retrieved successfully',
    type: [Attribute],
  })
  @ApiQuery({ name: 'shop_id', required: false, type: Number })
  @ApiQuery({ name: 'language', required: false, type: String })
  @ApiQuery({ name: 'searchJoin', required: false, enum: ['and', 'or'] })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'sortedBy', required: false, type: String })
  findAll(
    @Query('shop_id') shopId?: string,
    @Query('language') language?: string,
    @Query('searchJoin') searchJoin?: string,
    @Query('orderBy') orderBy?: string,
    @Query('sortedBy') sortedBy?: string,
  ): Promise<Attribute[]> {
    return this.attributesService.findAll({
      shop_id: shopId ? Number(shopId) : undefined,
      language,
      searchJoin,
      orderBy,
      sortedBy,
    });
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get attribute by ID or slug',
    description: 'Retrieve attribute details by ID or slug (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'Attribute ID or slug',
    example: '1 or color',
  })
  @ApiOkResponse({
    description: 'Attribute retrieved successfully',
    type: Attribute,
  })
  @ApiNotFoundResponse({ description: 'Attribute not found' })
  findOne(
    @Param('param') param: string,
    @Req() req: any,
  ): Promise<Attribute> {
    return this.attributesService.findOne(param, req?.query?.language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update attribute',
    description: 'Update attribute information by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiOkResponse({
    description: 'Attribute updated successfully',
    type: Attribute,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Attribute not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: UpdateAttributeDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    return this.attributesService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Delete attribute',
    description:
      'Permanently delete an attribute by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'Attribute ID', type: Number })
  @ApiOkResponse({
    description: 'Attribute deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Attribute not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.attributesService.remove(id);
  }
}
