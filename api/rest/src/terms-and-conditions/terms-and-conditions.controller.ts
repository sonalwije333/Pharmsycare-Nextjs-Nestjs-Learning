// terms-and-conditions/terms-and-conditions.controller.ts
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
import { TermsAndConditionsService } from './terms-and-conditions.service';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';
import { GetTermsAndConditionsDto, TermsAndConditionsPaginator } from './dto/get-terms-and-conditions.dto';
import { UpdateTermsAndConditionsDto } from './dto/update-terms-and-conditions.dto';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Terms and Conditions')
@Controller('terms-and-conditions')
@UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is ready
 @ApiBearerAuth('JWT-auth')
export class TermsAndConditionsController {
  constructor(private readonly termsAndConditionsService: TermsAndConditionsService) {}

  @Post()
  // @Roles(Permission.SUPER_ADMIN) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Create new terms and conditions',
    description: 'Creates new terms and conditions (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Terms and conditions created successfully',
    type: TermsAndConditions
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateTermsAndConditionsDto })
  createTermsAndConditions(
    @Body() createTermsAndConditionsDto: CreateTermsAndConditionsDto
  ): Promise<TermsAndConditions> {
    return this.termsAndConditionsService.create(createTermsAndConditionsDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all terms and conditions',
    description: 'Retrieve paginated list of all terms and conditions with filtering options'
  })
  @ApiOkResponse({
    description: 'Terms and conditions retrieved successfully',
    type: TermsAndConditionsPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title or description' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  @ApiQuery({ name: 'is_approved', required: false, type: Boolean, description: 'Filter by approval status' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Filter by language' })
  getTermsAndConditions(@Query() query: GetTermsAndConditionsDto): Promise<TermsAndConditionsPaginator> {
    return this.termsAndConditionsService.findAllTermsAndConditions(query);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get terms by ID or slug',
    description: 'Retrieve specific terms and conditions by ID or slug'
  })
  @ApiParam({
    name: 'param',
    description: 'Terms ID or slug',
    example: 'acceptance-of-terms or 1'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language code for translated content',
    example: 'en'
  })
  @ApiOkResponse({
    description: 'Terms and conditions retrieved successfully',
    type: TermsAndConditions
  })
  @ApiNotFoundResponse({ description: 'Terms and conditions not found' })
  findOne(
    @Param('param') param: string,
    @Query('language') language?: string
  ): Promise<TermsAndConditions> {
    return this.termsAndConditionsService.findOne(param, language);
  }

  @Put(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Update terms and conditions',
    description: 'Update existing terms and conditions by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Terms ID', type: Number })
  @ApiOkResponse({
    description: 'Terms and conditions updated successfully',
    type: TermsAndConditions
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Terms and conditions not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateTermsAndConditionsDto })
  updateTermsConditions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTermsAndConditionsDto: UpdateTermsAndConditionsDto
  ): Promise<TermsAndConditions> {
    return this.termsAndConditionsService.update(id, updateTermsAndConditionsDto);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete terms and conditions',
    description: 'Permanently delete terms and conditions by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Terms ID', type: Number })
  @ApiOkResponse({
    description: 'Terms and conditions deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Terms and conditions not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  deleteTermsAndConditions(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.termsAndConditionsService.remove(id);
  }
}

@ApiTags('Terms Approval')
@Controller('approve-terms-and-conditions')
 @UseGuards(JwtAuthGuard, RolesGuard) 
 @ApiBearerAuth('JWT-auth')
export class ApproveTermsAndConditionController {
  constructor(private readonly termsAndConditionsService: TermsAndConditionsService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve terms and conditions',
    description: 'Approve pending terms and conditions (Admin only)'
  })
  @ApiOkResponse({
    description: 'Terms approved successfully',
    type: TermsAndConditions
  })
  @ApiNotFoundResponse({ description: 'Terms not found' })
  @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number', example: 1 } } } })
  async approveTermsAndCondition(@Body('id', ParseIntPipe) id: number): Promise<TermsAndConditions> {
    return this.termsAndConditionsService.approveTermsAndCondition(id);
  }
}

@ApiTags('Terms Disapproval')
@Controller('disapprove-terms-and-conditions')
 @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is ready
 @ApiBearerAuth('JWT-auth')
export class DisapproveTermsAndConditionController {
  constructor(private readonly termsAndConditionsService: TermsAndConditionsService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disapprove terms and conditions',
    description: 'Disapprove/reject pending terms and conditions (Admin only)'
  })
  @ApiOkResponse({
    description: 'Terms disapproved successfully',
    type: TermsAndConditions
  })
  @ApiNotFoundResponse({ description: 'Terms not found' })
  @ApiBody({ schema: { type: 'object', properties: { id: { type: 'number', example: 1 } } } })
  async disapproveTermsAndCondition(@Body('id', ParseIntPipe) id: number): Promise<TermsAndConditions> {
    return this.termsAndConditionsService.disapproveTermsAndCondition(id);
  }
}