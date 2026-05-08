import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiResponseDto } from './dto/ai-response.dto';
import { AiStatus } from 'src/common/enums/ai-status.enum';


@Injectable()
export class AiService {
  async generate(createAiDto: CreateAiDto): Promise<AiResponseDto> {
    try {
      // Validate input
      if (!createAiDto.prompt || createAiDto.prompt.trim().length === 0) {
        throw new BadRequestException('Prompt cannot be empty');
      }

      if (createAiDto.prompt.length < 3) {
        throw new BadRequestException('Prompt must be at least 3 characters long');
      }

      if (createAiDto.prompt.length > 500) {
        throw new BadRequestException('Prompt cannot exceed 500 characters');
      }

      // Simulate AI processing
      const generatedResult = await this.generateAIResponse(createAiDto.prompt);

      return {
        status: AiStatus.SUCCESS,
        result: generatedResult,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log the error for debugging
      console.error('AI Service Error:', error);

      throw new InternalServerErrorException({
        status: AiStatus.FAILED,
        error: 'Failed to generate description. Please try again later.',
      });
    }
  }

  private async generateAIResponse(prompt: string): Promise<string> {
    // Simulate async AI processing with more realistic responses
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          `✨ AI Generated: Based on your prompt "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}", here is a creative and engaging description that captures the essence of your product. This high-quality item features premium materials, innovative design, and exceptional performance. Perfect for customers seeking reliability and style. Order now and experience the difference!`,

          `🚀 Generated Content: Your prompt "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}" has been processed. This product offers outstanding value with its cutting-edge features, durable construction, and user-friendly interface. Whether you're a beginner or expert, this item delivers consistent results. Don't miss out on this amazing opportunity!`,

          `💡 AI Response: For "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}", here's your personalized description. This exceptional product combines functionality with elegance, making it a must-have for modern lifestyles. With positive reviews from satisfied customers, you can trust in its quality and performance. Get yours today and elevate your experience!`,
        ];

        // Select a random response for variety
        const randomIndex = Math.floor(Math.random() * responses.length);
        resolve(responses[randomIndex]);
      }, 500);
    });
  }
}