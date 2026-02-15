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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUsersDto } from './dto/get-users.dto';
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
import { PermissionType } from '../../common/enums/PermissionType.enum';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import { QueryUsersOrderByColumn } from '../../common/enums/enums';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account. Requires admin privileges.',
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a list of all users with pagination and filtering.',
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
    name: 'text',
    required: false,
    type: String,
    description: 'Search text',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Advanced search',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: QueryUsersOrderByColumn,
    description: 'Order by field',
  })
  @ApiQuery({
    name: 'sortedBy',
    required: false,
    enum: SortOrder,
    description: 'Sort order',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information. Requires admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently deletes a user. Requires super admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('unblock-user')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Unblock user',
    description: 'Activates a previously blocked user account.',
  })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  activeUser(@Body('id') id: number) {
    return this.usersService.activeUser(+id);
  }

  @Post('block-user')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Block user',
    description: 'Blocks a user account temporarily.',
  })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  banUser(@Body('id') id: number) {
    return this.usersService.banUser(+id);
  }

  @Post('make-admin/:user_id')
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Make user admin',
    description:
      'Promotes a user to admin role. Requires super admin privileges.',
  })
  @ApiParam({ name: 'user_id', description: 'User ID to promote' })
  @ApiResponse({
    status: 200,
    description: 'User promoted to admin successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  makeAdmin(@Param('user_id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}

@ApiTags('Profiles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/profiles')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create profile',
    description: 'Creates a user profile.',
  })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  createProfile(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
    return this.usersService.createProfile(req.user.id, createProfileDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update profile',
    description: 'Updates a user profile.',
  })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(+id, updateProfileDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete profile',
    description: 'Deletes a user profile. Requires admin privileges.',
  })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  deleteProfile(@Param('id') id: string) {
    return this.usersService.removeProfile(+id);
  }
}

// Additional controllers for different user types remain the same but with v1/ prefix
@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/admin/list')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(PermissionType.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all admins',
    description:
      'Retrieves a list of all admin users. Requires super admin privileges.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Admins retrieved successfully' })
  getAllAdmin(@Query() query: GetUsersDto) {
    return this.usersService.getAdmin(query);
  }
}

@ApiTags('Vendors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/vendors/list')
export class VendorController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get all vendors',
    description: 'Retrieves a list of all vendor users.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  getAllVendor(@Query() query: GetUsersDto) {
    return this.usersService.getVendors(query);
  }
}

@ApiTags('Staff')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/my-staffs')
export class MyStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Get my staffs',
    description: 'Retrieves staff members for the current store owner.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Staffs retrieved successfully' })
  getAllMyStaffs(@Query() query: GetUsersDto) {
    return this.usersService.getMyStaffs(query);
  }
}

@ApiTags('Staff')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/all-staffs')
export class AllStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all staffs',
    description: 'Retrieves all staff members across all stores.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'All staffs retrieved successfully',
  })
  getAllStaffs(@Query() query: GetUsersDto) {
    return this.usersService.getAllStaffs(query);
  }
}

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/customers/list')
export class AllCustomerController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(
    PermissionType.SUPER_ADMIN,
    PermissionType.STORE_OWNER,
    PermissionType.STAFF,
  )
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieves a list of all customer users.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  getAllCustomers(@Query() query: GetUsersDto) {
    return this.usersService.getAllCustomers(query);
  }
}

