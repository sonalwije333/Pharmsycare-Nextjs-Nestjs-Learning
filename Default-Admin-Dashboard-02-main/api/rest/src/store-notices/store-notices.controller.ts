// store-notices/store-notices.controller.ts
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
import { StoreNoticesService } from './store-notices.service';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { GetStoreNoticesDto, StoreNoticePaginator } from './dto/get-store-notices.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import { StoreNotice, StoreNoticePriorityType } from './entities/store-notices.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { GetUsersDto } from 'src/users/dto/get-users.dto';
import { UserPaginator } from 'src/users/dto/get-users.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';

@ApiTags('Store Notices')
@Controller('store-notices')
@UseGuards(JwtAuthGuard, RolesGuard) 
@ApiBearerAuth('JWT-auth')
export class StoreNoticesController {
  constructor(private readonly storeNoticesService: StoreNoticesService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Create a new store notice',
    description: 'Creates a new store notice (Admin only)'
  })
  @ApiCreatedResponse({
    description: 'Store notice created successfully',
    type: StoreNotice
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateStoreNoticeDto })
  createStoreNotice(@Body() createStoreNoticeDto: CreateStoreNoticeDto): Promise<StoreNotice> {
    return this.storeNoticesService.create(createStoreNoticeDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Get all store notices',
    description: 'Retrieve paginated list of all store notices with filtering options'
  })
  @ApiOkResponse({
    description: 'Store notices retrieved successfully',
    type: StoreNoticePaginator
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in notice or description' })
  @ApiQuery({ name: 'priority', required: false, enum: StoreNoticePriorityType, description: 'Filter by priority' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filter by type' })
  @ApiQuery({ name: 'user_id', required: false, type: Number, description: 'Filter by user ID' })
  getStoreNotices(@Query() query: GetStoreNoticesDto): Promise<StoreNoticePaginator> {
    return this.storeNoticesService.getStoreNotices(query);
  }

  @Get('users-to-notify')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Get users to notify',
    description: 'Retrieve list of users who can receive store notices'
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UserPaginator
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  getUsersToNotify(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.storeNoticesService.getUsersToNotify(query);
  }

  @Get('getUsersToNotify')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get users to notify (legacy route)',
    description: 'Backward-compatible route for clients using getUsersToNotify path',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UserPaginator,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  getUsersToNotifyLegacy(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.storeNoticesService.getUsersToNotify(query);
  }

  @Get(':id')
   @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @ApiOperation({
    summary: 'Get store notice by ID',
    description: 'Retrieve a specific store notice by ID'
  })
  @ApiParam({ name: 'id', description: 'Store notice ID', type: Number })
  @ApiOkResponse({
    description: 'Store notice retrieved successfully',
    type: StoreNotice
  })
  @ApiNotFoundResponse({ description: 'Store notice not found' })
  getStoreNotice(@Param('id', ParseIntPipe) id: number): Promise<StoreNotice> {
    return this.storeNoticesService.getStoreNotice(id);
  }

  @Put(':id')
   @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update store notice',
    description: 'Update an existing store notice by ID (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Store notice ID', type: Number })
  @ApiOkResponse({
    description: 'Store notice updated successfully',
    type: StoreNotice
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Store notice not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateStoreNoticeDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreNoticeDto: UpdateStoreNoticeDto
  ): Promise<StoreNotice> {
    return this.storeNoticesService.update(id, updateStoreNoticeDto);
  }

  @Put(':id/mark-as-read')
   @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER) 
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark store notice as read',
    description: 'Mark a store notice as read for the current user'
  })
  @ApiParam({ name: 'id', description: 'Store notice ID', type: Number })
  @ApiOkResponse({
    description: 'Store notice marked as read successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Store notice not found' })
  markAsRead(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.storeNoticesService.markAsRead(id);
  }

  @Delete(':id')
   @Roles(Permission.SUPER_ADMIN) 
  @ApiOperation({
    summary: 'Delete store notice',
    description: 'Permanently delete a store notice (Admin only)'
  })
  @ApiParam({ name: 'id', description: 'Store notice ID', type: Number })
  @ApiOkResponse({
    description: 'Store notice deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Store notice not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  deleteStoreNotice(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.storeNoticesService.remove(id);
  }
}