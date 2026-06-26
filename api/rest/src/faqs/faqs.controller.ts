// faqs/faqs.controller.ts
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
  Request,
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
import { FaqsService } from './faqs.service';
import { GetFaqsDto, FaqPaginator } from './dto/get-faqs.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
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
    type: Faq,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: CreateFaqDto })
  createFaq(@Body() createFaqDto: CreateFaqDto, @Request() req: any): Promise<Faq> {
    createFaqDto.issued_by = req.user?.name ?? createFaqDto.issued_by;
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
  @ApiQuery({ name: 'faq_type', required: false })
  @ApiQuery({ name: 'shop_id', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: GetFaqsDto): Promise<FaqPaginator> {
    return this.faqService.findAllFaqs(query);
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
  })
  @ApiOkResponse({
    description: 'FAQ retrieved successfully',
    type: Faq,
  })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @ApiQuery({ name: 'language', required: false })
  getFaq(
    @Param('param') param: string,
    @Query('language') language: string,
  ): Promise<Faq> {
    return this.faqService.getFaq(param, language);
  }

  @Put(':id')
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiOperation({
    summary: 'Update FAQ',
    description: 'Update FAQ information by ID (Admin/Store Owner only)',
  })
  @ApiParam({ name: 'id', description: 'FAQ ID', type: Number })
  @ApiOkResponse({
    description: 'FAQ updated successfully',
    type: Faq,
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
    description: 'Permanently delete a FAQ by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'FAQ ID', type: Number })
  @ApiOkResponse({
    description: 'FAQ deleted successfully',
    type: CoreMutationOutput,
  })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  deleteFaq(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CoreMutationOutput> {
    return this.faqService.remove(id);
  }
}
