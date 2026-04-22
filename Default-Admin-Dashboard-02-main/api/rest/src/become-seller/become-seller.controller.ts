// become-seller/become-seller.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { CreateBecomeSellerDto } from './dto/create-become-seller.dto';
import { UpdateBecomeSellerDto } from './dto/update-become-seller.dto';
import { BecomeSellerService } from './become-seller.service';
import { BecomeSeller } from './entities/become-seller.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Permission } from '../common/enums/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🛍️ Become Seller')
@Controller(['become-seller', 'became-seller'])
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class BecomeSellerController {
  constructor(private readonly becomeSellerService: BecomeSellerService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create become seller configuration',
    description: 'Creates a new become seller page configuration (Admin only)',
  })
  @ApiCreatedResponse({
    description: 'Configuration created successfully',
    type: BecomeSeller,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateBecomeSellerDto })
  create(
    @Body() createBecomeSellerDto: CreateBecomeSellerDto,
  ): Promise<BecomeSeller> {
    return this.becomeSellerService.create(createBecomeSellerDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get become seller configuration',
    description: 'Retrieve the become seller page configuration (Public)',
  })
  @ApiOkResponse({
    description: 'Configuration retrieved successfully',
    type: BecomeSeller,
  })
  findAll(): Promise<BecomeSeller> {
    return this.becomeSellerService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get become seller configuration by ID',
    description:
      'Retrieve a specific become seller configuration by ID (Public)',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID', type: Number })
  @ApiOkResponse({
    description: 'Configuration retrieved successfully',
    type: BecomeSeller,
  })
  @ApiNotFoundResponse({ description: 'Configuration not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BecomeSeller> {
    return this.becomeSellerService.findOne(id);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Update become seller configuration',
    description: 'Update become seller configuration by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID', type: Number })
  @ApiOkResponse({
    description: 'Configuration updated successfully',
    type: BecomeSeller,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Configuration not found' })
  @ApiBody({ type: UpdateBecomeSellerDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBecomeSellerDto: UpdateBecomeSellerDto,
  ): Promise<BecomeSeller> {
    return this.becomeSellerService.update(id, updateBecomeSellerDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete become seller configuration',
    description:
      'Permanently delete a become seller configuration by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Configuration ID', type: Number })
  @ApiOkResponse({
    description: 'Configuration deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'Configuration not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.becomeSellerService.remove(id);
  }
}
