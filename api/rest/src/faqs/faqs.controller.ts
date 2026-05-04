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
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { GetFaqsDto, FaqPaginator } from './dto/get-faqs.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission, SortOrder } from '../common/enums/enums';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('❓ FAQs')
@Controller('faqs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FaqsController {
  constructor(private faqService: FaqsService) {}

  @Post()
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Create a new FAQ',
    description: 'Creates a new FAQ (Admin/Store Owner only)',
  })
  @ApiCreatedResponse({
    description: 'FAQ created successfully',
    type: () => Faq,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFaqDto })
  create(@Body() createFaqDto: CreateFaqDto): Promise<Faq> {
    return this.faqService.create(createFaqDto);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all FAQs',
    description: 'Retrieve paginated list of all FAQs (Public)',
  })
  @ApiOkResponse({
    description: 'FAQs retrieved successfully',
    type: FaqPaginator,
  })
  findAll(@Query() query: GetFaqsDto): Promise<FaqPaginator> {
    return this.faqService.findAll(query);
  }

  @Get(':param')
  @Public()
  @ApiOperation({
    summary: 'Get FAQ by ID or slug',
    description: 'Retrieve FAQ details by ID or slug (Public)',
  })
  @ApiParam({
    name: 'param',
    description: 'FAQ ID or slug',
    example: '1 or what-is-your-return-policy',
    type: String,
  })
  @ApiOkResponse({
    description: 'FAQ retrieved successfully',
    type: () => Faq,
  })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  findOne(
    @Param('param') param: string,
    @Query('language') language?: string,
  ): Promise<Faq> {
    return this.faqService.findOne(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update FAQ',
    description: 'Update FAQ information by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'FAQ ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'FAQ updated successfully',
    type: () => Faq,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @ApiBody({ type: UpdateFaqDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFaqDto: UpdateFaqDto,
  ): Promise<Faq> {
    return this.faqService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @Roles(Permission.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Delete FAQ',
    description: 'Soft delete a FAQ by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'FAQ ID', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'FAQ deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<CoreMutationOutput> {
    return this.faqService.remove(id);
  }
}