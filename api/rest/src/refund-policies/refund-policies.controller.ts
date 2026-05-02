// refund-policies/refund-policies.controller.ts
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
import { RefundPoliciesService } from './refund-policies.service';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto, RefundPolicyPaginator } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import { RefundPolicy } from './entities/refund-policies.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Refund Policies')
@Controller('refund-policies')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class RefundPoliciesController {
  constructor(private readonly refundPoliciesService: RefundPoliciesService) {}

  @Post()
  // @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Create a new refund policy',
    description: 'Creates a new refund policy (Admin/Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Refund policy created successfully',
    type: RefundPolicy
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateRefundPolicyDto })
  createRefundPolicy(@Body() createRefundPolicyDto: CreateRefundPolicyDto): Promise<RefundPolicy> {
    return this.refundPoliciesService.create(createRefundPolicyDto);
  }

  @Get()
  @Public() // Make public for now, remove when auth is implemented
  @ApiOperation({
    summary: 'Get all refund policies',
    description: 'Retrieve paginated list of all refund policies with filtering options'
  })
  @ApiOkResponse({
    description: 'Refund policies retrieved successfully',
    type: RefundPolicyPaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by title' })
  @ApiQuery({ name: 'target', required: false, enum: ['vendor', 'customer'], description: 'Filter by target' })
  @ApiQuery({ name: 'status', required: false, enum: ['approved', 'pending', 'rejected'], description: 'Filter by status' })
  findAll(@Query() query: GetRefundPolicyDto): Promise<RefundPolicyPaginator> {
    return this.refundPoliciesService.findAllRefundPolicies(query);
  }

  @Get(':param')
  @Public() // Make public for now, remove when auth is implemented
  @ApiOperation({
    summary: 'Get refund policy by ID or slug',
    description: 'Retrieve a specific refund policy by ID or slug'
  })
  @ApiParam({
    name: 'param',
    description: 'Refund policy ID or slug',
    example: 'vendor-return-policy or 1'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Language code for translated content',
    example: 'en'
  })
  @ApiOkResponse({
    description: 'Refund policy retrieved successfully',
    type: RefundPolicy
  })
  @ApiNotFoundResponse({ description: 'Refund policy not found' })
  getRefundPolicy(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<RefundPolicy> {
    return this.refundPoliciesService.getRefundPolicy(param, language);
  }

  @Put(':id')
  // @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) // Uncomment when roles are ready
  @ApiOperation({
    summary: 'Update refund policy',
    description: 'Update an existing refund policy by ID (Admin/Store owner only)'
  })
  @ApiParam({ name: 'id', description: 'Refund policy ID', type: Number })
  @ApiOkResponse({
    description: 'Refund policy updated successfully',
    type: RefundPolicy
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Refund policy not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateRefundPolicyDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRefundPolicyDto: UpdateRefundPolicyDto,
  ): Promise<RefundPolicy> {
    return this.refundPoliciesService.update(id, updateRefundPolicyDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete refund policy',
    description: 'Permanently delete a refund policy (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Refund policy ID', type: Number })
  @ApiOkResponse({
    description: 'Refund policy deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Refund policy not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.refundPoliciesService.remove(id);
  }
}