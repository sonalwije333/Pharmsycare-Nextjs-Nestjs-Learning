import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateAiDto } from './dto/create-ai.dto';
import { GetAiTasksDto } from './dto/get-ai-tasks.dto';
import { AiTask } from './entities/ai.entity';
import { paginate } from '../common/pagination/paginate';
import { AiStatus, AiTaskType } from 'src/common/enums/enums';
import { SortOrder } from '../common/dto/generic-conditions.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiTask)
    private readonly aiTaskRepository: Repository<AiTask>,
  ) {}

  async create(createAiDto: CreateAiDto, userId?: number): Promise<AiTask> {
    try {
      const aiTask = this.aiTaskRepository.create({
        ...createAiDto,
        status: AiStatus.PROCESSING,
        user_id: userId,
      });

      const savedTask = await this.aiTaskRepository.save(aiTask);

      // Simulate AI processing (replace with actual AI service integration)
      setTimeout(async () => {
        try {
          await this.processAiTask(savedTask.id);
        } catch (error) {
          console.error('AI processing failed:', error);
        }
      }, 2000);

      return savedTask;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create AI task');
    }
  }

  private async processAiTask(taskId: number): Promise<void> {
    const task = await this.aiTaskRepository.findOne({ where: { id: taskId } });

    if (!task) return;

    try {
      // Simulate AI processing - replace with actual AI API call
      const result = await this.callAiService(task.prompt, task.task_type, task.context);

      // Fix: Use a more specific type for metadata or cast to any
      await this.aiTaskRepository.update(taskId, {
        status: AiStatus.SUCCESS,
        result: result,
        metadata: { processed_at: new Date().toISOString() } as any, // Convert to string or use type assertion
      });
    } catch (error) {
      await this.aiTaskRepository.update(taskId, {
        status: AiStatus.FAILED,
        error_message: error.message,
      });
    }
  }

  private async callAiService(prompt: string, taskType: AiTaskType, context?: string): Promise<string> {
    // Replace with actual AI service integration (OpenAI, Hugging Face, etc.)
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call

    const responses = {
      [AiTaskType.DESCRIPTION_GENERATION]: `Generated description for: ${prompt}. ${context ? `Context: ${context}` : ''}`,
      [AiTaskType.IMAGE_GENERATION]: `Image generation prompt: ${prompt}`,
      [AiTaskType.CONTENT_SUMMARY]: `Summary of: ${prompt}`,
      [AiTaskType.TRANSLATION]: `Translation of: ${prompt}`,
    };

    return responses[taskType] || `AI response for: ${prompt}`;
  }

  async findAll(getAiTasksDto: GetAiTasksDto, userId?: number): Promise<any> {
    try {
      const page = getAiTasksDto.page ?? 1;
      const limit = getAiTasksDto.limit ?? 10;
      const sortedBy = getAiTasksDto.sortedBy ?? SortOrder.DESC;

      const skip = (page - 1) * limit;
      const take = limit;

      // Build where conditions
      const where: any = {};

      if (userId) {
        where.user_id = userId;
      }

      if (getAiTasksDto.status) {
        where.status = getAiTasksDto.status;
      }

      if (getAiTasksDto.task_type) {
        where.task_type = getAiTasksDto.task_type;
      }

      if (getAiTasksDto.search) {
        where.prompt = ILike(`%${getAiTasksDto.search}%`);
      }

      const [data, total] = await this.aiTaskRepository.findAndCount({
        where,
        relations: ['user'],
        skip,
        take,
        order: { created_at: sortedBy === SortOrder.ASC ? 'ASC' : 'DESC' },
      });

      const url = `/ai/tasks?limit=${limit}&page=${page}`;

      return {
        data,
        ...paginate(total, page, limit, data.length, url),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch AI tasks');
    }
  }

  async findOne(id: number, userId?: number): Promise<AiTask> {
    try {
      const where: any = { id };
      if (userId) {
        where.user_id = userId;
      }

      const aiTask = await this.aiTaskRepository.findOne({
        where,
        relations: ['user'],
      });

      if (!aiTask) {
        throw new NotFoundException(`AI task with ID ${id} not found`);
      }

      return aiTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch AI task');
    }
  }

  async remove(id: number, userId?: number): Promise<void> {
    try {
      const where: any = { id };
      if (userId) {
        where.user_id = userId;
      }

      const aiTask = await this.aiTaskRepository.findOne({ where });

      if (!aiTask) {
        throw new NotFoundException(`AI task with ID ${id} not found`);
      }

      await this.aiTaskRepository.remove(aiTask);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete AI task');
    }
  }

  async retryTask(id: number, userId?: number): Promise<AiTask> {
    try {
      const where: any = { id };
      if (userId) {
        where.user_id = userId;
      }

      const aiTask = await this.aiTaskRepository.findOne({ where });

      if (!aiTask) {
        throw new NotFoundException(`AI task with ID ${id} not found`);
      }

      if (aiTask.status !== AiStatus.FAILED) {
        throw new ForbiddenException('Only failed tasks can be retried');
      }

      // Fix: Use undefined instead of null for optional fields
      await this.aiTaskRepository.update(id, {
        status: AiStatus.PROCESSING,
        error_message: undefined,
      });

      // Retry processing
      setTimeout(async () => {
        try {
          await this.processAiTask(id);
        } catch (error) {
          console.error('AI retry failed:', error);
        }
      }, 2000);

      return this.findOne(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retry AI task');
    }
  }
}