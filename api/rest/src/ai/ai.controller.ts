// ai/ai.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiResponseDto } from './dto/ai-response.dto';

@ApiTags('🤖 AI Integration')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-descriptions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI descriptions',
    description:
      'Generate product or content descriptions using AI based on the provided prompt',
  })
  @ApiOkResponse({
    description: 'Description generated successfully',
    type: AiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid prompt provided',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'failed' },
        error: { type: 'string', example: 'Prompt cannot be empty' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'AI service error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'failed' },
        error: { type: 'string', example: 'AI service unavailable' },
      },
    },
  })
  @ApiBody({
    type: CreateAiDto,
    description: 'Prompt for AI generation',
    examples: {
      product_description: {
        summary: 'Generate product description',
        value: { prompt: 'Generate a description for a wireless gaming mouse' },
      },
      blog_post: {
        summary: 'Generate blog post',
        value: { prompt: 'Write a blog post about healthy eating habits' },
      },
    },
  })
  create(@Body() createAiDto: CreateAiDto): Promise<AiResponseDto> {
    return this.aiService.create(createAiDto);
  }
}
