import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiResponseDto } from './dto/ai-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Permission } from '../common/enums/enums';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🤖 AI Integration')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-descriptions')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI descriptions',
    description: 'Generate product or content descriptions using AI based on the provided prompt',
  })
  @ApiOkResponse({
    description: 'Description generated successfully',
    type: () => AiResponseDto,
    schema: {
      example: {
        status: 'success',
        result: 'This is a generated description for your product...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid prompt provided',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Prompt cannot be empty' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'AI service error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Failed to generate description' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  @ApiBody({
    type: CreateAiDto,
    description: 'Prompt for AI generation',
    examples: {
      product_description: {
        summary: 'Generate product description',
        description: 'Example for generating a product description',
        value: { prompt: 'Generate a description for a wireless gaming mouse' },
      },
      blog_post: {
        summary: 'Generate blog post',
        description: 'Example for generating a blog post',
        value: { prompt: 'Write a blog post about healthy eating habits' },
      },
      seo_meta: {
        summary: 'Generate SEO meta description',
        description: 'Example for generating SEO meta description',
        value: { prompt: 'Generate SEO meta description for an e-commerce website' },
      },
    },
  })
  generate(@Body() createAiDto: CreateAiDto): Promise<AiResponseDto> {
    return this.aiService.generate(createAiDto);
  }
}