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
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesDto } from './dto/get-addresses.dto';
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

@ApiTags('Addresses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Create a new address', description: 'Creates a new address for a customer. Requires appropriate permissions.' })
  @ApiResponse({ status: 201, description: 'Address successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  createAddress(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get()
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get all addresses', description: 'Retrieves a list of addresses with filtering and pagination.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'type', required: false, enum: ['billing', 'shipping'], description: 'Filter by address type' })
  @ApiQuery({ name: 'customer_id', required: false, type: Number, description: 'Filter by customer ID' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  getAddresses(@Query() query: GetAddressesDto) {
    return this.addressesService.findAll(query);
  }

  @Get(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get address by ID', description: 'Retrieves a specific address by its ID.' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  getAddress(@Param('id') id: string) {
    return this.addressesService.findOne(+id);
  }

  @Put(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Update address', description: 'Updates an existing address.' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiOperation({ summary: 'Delete address', description: 'Permanently deletes an address. Requires admin privileges.' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@Param('id') id: string) {
    return this.addressesService.remove(+id);
  }

  @Post(':id/set-default')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Set default address', description: 'Sets an address as the default address for the customer.' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  @ApiResponse({ status: 200, description: 'Address set as default successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  setDefaultAddress(@Param('id') id: string) {
    return this.addressesService.setDefaultAddress(+id);
  }

  @Get('customer/:customerId')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
  @ApiOperation({ summary: 'Get customer addresses', description: 'Retrieves all addresses for a specific customer.' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer addresses retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  getCustomerAddresses(@Param('customerId') customerId: string) {
    return this.addressesService.getCustomerAddresses(+customerId);
  }
}