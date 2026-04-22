// addresses/addresses.controller.ts
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
  UnauthorizedException,
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
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesDto, AddressPaginator } from './dto/get-addresses.dto';
import { Address } from './entities/address.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('📍 Addresses')
@Controller('address')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create a new address',
    description:
      'Creates a new address for the authenticated user or specified customer',
  })
  @ApiCreatedResponse({
    description: 'Address created successfully',
    type: Address,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreateAddressDto })
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: any,
  ): Promise<Address> {
    // If user is not admin, use their own ID
    if (!user?.permissions?.includes(Permission.SUPER_ADMIN)) {
      createAddressDto.customer_id = user.id;
    }
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all addresses',
    description: 'Retrieve paginated list of all addresses (Admin only)',
  })
  @ApiOkResponse({
    description: 'Addresses retrieved successfully',
    type: AddressPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  async addresses(@Query() query: GetAddressesDto): Promise<AddressPaginator> {
    return this.addressesService.findAll(query);
  }

  @Get('my-addresses')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get my addresses',
    description:
      'Retrieve paginated list of addresses for the authenticated user',
  })
  @ApiOkResponse({
    description: 'Addresses retrieved successfully',
    type: AddressPaginator,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async myAddresses(
    @Query() query: GetAddressesDto,
    @CurrentUser() user: any,
  ): Promise<AddressPaginator> {
    return this.addressesService.findByCustomer(user.id, query);
  }

  @Get(':id')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get address by ID',
    description: 'Retrieve address details by ID',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiOkResponse({
    description: 'Address retrieved successfully',
    type: Address,
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async address(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<Address> {
    const address = await this.addressesService.findOne(id);

    // Check if user has permission to view this address
    if (
      !user?.permissions?.includes(Permission.SUPER_ADMIN) &&
      address.customer_id !== user.id
    ) {
      throw new UnauthorizedException(
        'You do not have permission to view this address',
      );
    }

    return address;
  }

  @Put(':id')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update address',
    description: 'Update address information by ID',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiOkResponse({
    description: 'Address updated successfully',
    type: Address,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: UpdateAddressDto })
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: any,
  ): Promise<Address> {
    // Check if user has permission to update this address
    const address = await this.addressesService.findOne(id);

    if (
      !user?.permissions?.includes(Permission.SUPER_ADMIN) &&
      address.customer_id !== user.id
    ) {
      throw new UnauthorizedException(
        'You do not have permission to update this address',
      );
    }

    return this.addressesService.update(id, updateAddressDto);
  }

  @Delete(':id')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER, Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete address',
    description: 'Permanently delete an address by ID',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiOkResponse({
    description: 'Address deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async deleteAddress(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<CoreMutationOutput> {
    // Check if user has permission to delete this address
    const address = await this.addressesService.findOne(id);

    if (
      !user?.permissions?.includes(Permission.SUPER_ADMIN) &&
      address.customer_id !== user.id
    ) {
      throw new UnauthorizedException(
        'You do not have permission to delete this address',
      );
    }

    return this.addressesService.remove(id);
  }

  @Post(':id/set-default')
  @Roles(Permission.CUSTOMER, Permission.STORE_OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set address as default',
    description: 'Set an address as the default address for the user',
  })
  @ApiParam({ name: 'id', description: 'Address ID', type: Number })
  @ApiOkResponse({
    description: 'Address set as default successfully',
    type: Address,
  })
  @ApiNotFoundResponse({ description: 'Address not found' })
  async setDefaultAddress(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<Address> {
    return this.addressesService.setDefaultAddress(id, user.id);
  }
}
