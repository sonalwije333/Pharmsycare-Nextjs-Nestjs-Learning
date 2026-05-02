// ownership-transfer/ownership-transfer.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
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
import { OwnershipTransferService } from './ownership-transfer.service';
import { CreateOwnershipTransferDto } from './dto/create-ownership-transfer.dto';
import { GetOwnershipTransferDto, OwnershipTransferPaginator } from './dto/get-ownership-transfer.dto';
import { UpdateOwnershipTransferDto } from './dto/update-ownership-transfer.dto';
import { OwnershipTransfer } from './entities/ownership-transfer.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from "src/common/decorators/roles.decorator";
import { Permission } from '../common/enums/enums';


@ApiTags('🔄 Ownership Transfer')
@Controller('ownership-transfer')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OwnershipTransferController {
  constructor(private ownershipTransferService: OwnershipTransferService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create ownership transfer',
    description: 'Create a new ownership transfer request (Admin/Store owner only)'
  })
  @ApiCreatedResponse({
    description: 'Ownership transfer created successfully',
    type: OwnershipTransfer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateOwnershipTransferDto })
  createOwnershipTransfer(@Body() createOwnershipTransferDto: CreateOwnershipTransferDto) {
    return this.ownershipTransferService.create(createOwnershipTransferDto);
  }

  @Get()
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Get all ownership transfers',
    description: 'Retrieve paginated list of ownership transfers (Admin only)'
  })
  @ApiOkResponse({
    description: 'Ownership transfers retrieved successfully',
    type: OwnershipTransferPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findAll(@Query() query: GetOwnershipTransferDto) {
    return this.ownershipTransferService.findAll(query);
  }

  @Get(':param')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Get ownership transfer by ID or identifier',
    description: 'Retrieve a single ownership transfer by ID or transaction identifier'
  })
  @ApiParam({
    name: 'param',
    description: 'Ownership transfer ID or transaction identifier',
    example: '10'
  })
  @ApiOkResponse({
    description: 'Ownership transfer retrieved successfully',
    type: OwnershipTransfer
  })
  @ApiNotFoundResponse({ description: 'Ownership transfer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getOwnershipTransfer(
    @Param('param') param: string,
    @Query('language') language: string,
  ) {
    return this.ownershipTransferService.getOwnershipTransfer(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update ownership transfer',
    description: 'Update ownership transfer status or details (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Ownership transfer ID',
    type: Number,
    example: 10
  })
  @ApiOkResponse({
    description: 'Ownership transfer updated successfully',
    type: OwnershipTransfer
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Ownership transfer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateOwnershipTransferDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOwnershipTransferDto: UpdateOwnershipTransferDto,
  ) {
    return this.ownershipTransferService.update(id, updateOwnershipTransferDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete ownership transfer',
    description: 'Delete an ownership transfer by ID (Admin only)'
  })
  @ApiParam({
    name: 'id',
    description: 'Ownership transfer ID',
    type: Number,
    example: 10
  })
  @ApiOkResponse({
    description: 'Ownership transfer deleted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Ownership transfer not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  deleteOwnershipTransfer(@Param('id', ParseIntPipe) id: number) {
    return this.ownershipTransferService.remove(id);
  }
}