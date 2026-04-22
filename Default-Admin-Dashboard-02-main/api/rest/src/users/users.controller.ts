// users/users.controller.ts
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto, UpdateProfileDto } from './dto/create-profile.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { AddStaffDto } from './dto/add-staff.dto';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import {Roles} from "../common/decorators/roles.decorator";

@ApiTags('👥 Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with profile and addresses (Admin only)',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of all users (Admin only)',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: UserPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  getAllUsers(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed user information by ID',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by ID',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: UpdateUserDto })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  removeUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CoreMutationOutput> {
    return this.usersService.remove(id);
  }

  @Post('unblock-user')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unblock user',
    description: 'Activate a blocked user account (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
      },
    },
  })
  @ApiOkResponse({
    description: 'User activated successfully',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  activeUser(@Body('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.activeUser(id);
  }

  @Post('block-user')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Block user',
    description: 'Deactivate a user account (Admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
      },
    },
  })
  @ApiOkResponse({
    description: 'User blocked successfully',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  banUser(@Body('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.banUser(id);
  }

  @Post('make-admin/:user_id')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Make user admin',
    description: 'Grant super admin permissions to a user (Admin only)',
  })
  @ApiParam({ name: 'user_id', description: 'User ID', type: Number })
  @ApiOkResponse({
    description: 'User promoted to admin successfully',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  makeAdmin(@Param('user_id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.makeAdmin(id);
  }

  @Post('add-staff')
  @Roles(Permission.STORE_OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add staff member',
    description: 'Add a new staff member to a shop (Store owner only)',
  })
  @ApiCreatedResponse({
    description: 'Staff added successfully',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: AddStaffDto })
  addStaff(@Body() addStaffDto: AddStaffDto): Promise<User> {
    return this.usersService.addStaff(addStaffDto);
  }
}

@ApiTags('👤 Profiles')
@Controller('profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Create profile',
    description: 'Create a new user profile',
  })
  @ApiCreatedResponse({
    description: 'Profile created successfully',
    type: Profile,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: CreateProfileDto })
  createProfile(@Body() createProfileDto: CreateProfileDto): Promise<Profile> {
    return this.usersService.createProfile(createProfileDto);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.CUSTOMER)
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update user profile by ID',
  })
  @ApiParam({ name: 'id', description: 'Profile ID', type: Number })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: Profile,
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.usersService.updateProfile(id, updateProfileDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete profile',
    description: 'Delete a user profile (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Profile ID', type: Number })
  @ApiOkResponse({
    description: 'Profile deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  deleteProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CoreMutationOutput> {
    return this.usersService.deleteProfile(id);
  }
}

@ApiTags('👑 Admin Management')
@Controller('admin/list')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all admins',
    description: 'Retrieve paginated list of admin users (Super admin only)',
  })
  @ApiOkResponse({
    description: 'Admins retrieved successfully',
    type: UserPaginator,
  })
  getAllAdmin(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getAdmin(query);
  }
}

@ApiTags('🏪 Vendor Management')
@Controller('vendors/list')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class VendorController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all vendors',
    description: 'Retrieve paginated list of vendor users (Admin only)',
  })
  @ApiOkResponse({
    description: 'Vendors retrieved successfully',
    type: UserPaginator,
  })
  getAllVendor(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getVendors(query);
  }
}

@ApiTags('👥 Staff Management')
@Controller('my-staffs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MyStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get my staff',
    description:
      'Retrieve paginated list of staff belonging to current store owner',
  })
  @ApiOkResponse({
    description: 'Staff retrieved successfully',
    type: UserPaginator,
  })
  getAllMyStaffs(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getMyStaffs(query);
  }
}

@ApiTags('👥 Staff Management')
@Controller('all-staffs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AllStaffsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all staff',
    description: 'Retrieve paginated list of all staff members',
  })
  @ApiOkResponse({
    description: 'Staff retrieved successfully',
    type: UserPaginator,
  })
  getAllStaffs(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getAllStaffs(query);
  }
}

@ApiTags('👥 Customer Management')
@Controller('customers/list')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AllCustomerController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieve paginated list of all customers',
  })
  @ApiOkResponse({
    description: 'Customers retrieved successfully',
    type: UserPaginator,
  })
  getAllCustomers(@Query() query: GetUsersDto): Promise<UserPaginator> {
    return this.usersService.getAllCustomers(query);
  }
}
