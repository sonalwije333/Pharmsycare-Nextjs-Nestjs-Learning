// ai/ai.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiResponseDto } from './dto/ai-response.dto';

@Injectable()
export class AiService {
  async create(createAiDto: CreateAiDto): Promise<AiResponseDto> {
    try {
      // Validate input
      if (!createAiDto.prompt || createAiDto.prompt.trim().length === 0) {
        throw new BadRequestException('Prompt cannot be empty');
      }

      if (createAiDto.prompt.length < 3) {
        throw new BadRequestException(
          'Prompt must be at least 3 characters long',
        );
      }

      // Simulate AI processing
      // In a real implementation, you would call an AI service here
      const generatedResult = await this.generateAIResponse(createAiDto.prompt);

      return {
        status: 'success',
        result: generatedResult,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log the error for debugging
      console.error('AI Service Error:', error);

      throw new InternalServerErrorException({
        status: 'failed',
        error: 'Failed to generate description. Please try again later.',
      });
    }
  }

  private async generateAIResponse(prompt: string): Promise<string> {
    // Simulate async AI processing
    // In production, replace this with actual AI API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `This is a dummy response for prompt: "${prompt.substring(0, 50)}${
            prompt.length > 50 ? '...' : ''
          }"`,
        );
      }, 500);
    });
  }
}
