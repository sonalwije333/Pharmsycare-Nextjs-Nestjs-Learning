// refund-reasons/refund-reasons.controller.ts
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
  ParseIntPipe
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
  ApiCreatedResponse
} from '@nestjs/swagger';
import { RefundReasonsService } from './refund-reasons.service';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import { GetRefundReasonDto, RefundReasonPaginator } from './dto/get-refund-reasons.dto';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { RefundReason } from './entities/refund-reasons.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Refund Reasons')
@Controller('refund-reasons')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class RefundReasonsController {
  constructor(private readonly refundReasonsService: RefundReasonsService) {}

  @Post()
   @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Create a new refund reason',
    description: 'Creates a new refund reason (Admin/Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Refund reason created successfully',
    type: RefundReason
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateRefundReasonDto })
  createRefundReason(@Body() createRefundReasonDto: CreateRefundReasonDto): Promise<RefundReason> {
    return this.refundReasonsService.create(createRefundReasonDto);
  }

  @Get()
  @Public() 
  @ApiOperation({
    summary: 'Get all refund reasons',
    description: 'Retrieve paginated list of all refund reasons with filtering options'
  })
  @ApiOkResponse({
    description: 'Refund reasons retrieved successfully',
    type: RefundReasonPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'language', required: false, type: String, description: 'Filter by language' })
  findAll(@Query() query: GetRefundReasonDto): Promise<RefundReasonPaginator> {
    return this.refundReasonsService.findAllRefundReasons(query);
  }

  @Get(':param')
  @Public() // Make public for now, remove when auth is implemented
  @ApiOperation({
    summary: 'Get refund reason by ID or slug',
    description: 'Retrieve a specific refund reason by ID or slug'
  })
  @ApiParam({
    name: 'param',
    description: 'Refund reason ID or slug',
    example: 'product-not-as-described or 1'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language code for translated content',
    example: 'en'
  })
  @ApiOkResponse({
    description: 'Refund reason retrieved successfully',
    type: RefundReason
  })
  @ApiNotFoundResponse({ description: 'Refund reason not found' })
  getRefundReason(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<RefundReason> {
    return this.refundReasonsService.getRefundReason(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Update refund reason',
    description: 'Update an existing refund reason by ID (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund reason ID', type: Number })
  @ApiOkResponse({
    description: 'Refund reason updated successfully',
    type: RefundReason
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Refund reason not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateRefundReasonDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRefundReasonDto: UpdateRefundReasonDto,
  ): Promise<RefundReason> {
    return this.refundReasonsService.update(id, updateRefundReasonDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete refund reason',
    description: 'Permanently delete a refund reason (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Refund reason ID', type: Number })
  @ApiOkResponse({
    description: 'Refund reason deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Refund reason not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.refundReasonsService.remove(id);
  }
}