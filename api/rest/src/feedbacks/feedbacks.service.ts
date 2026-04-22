// feedbacks/feedbacks.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { GetFeedbacksDto } from './dto/get-feedbacks.dto';
import { Feedback } from './entities/feedback.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { FeedbackPaginator } from './dto/feedback-response.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedBackDto: CreateFeedBackDto): Promise<Feedback> {
    // Check if both positive and negative are set (they should be mutually exclusive)
    if (createFeedBackDto.positive && createFeedBackDto.negative) {
      throw new BadRequestException(
        'Feedback cannot be both positive and negative',
      );
    }

    // Check if user already gave feedback for this model
    const existing = await this.feedbackRepository.findOne({
      where: {
        user_id: createFeedBackDto.user_id,
        model_type: createFeedBackDto.model_type,
        model_id: createFeedBackDto.model_id,
      },
    });

    if (existing) {
      // Update existing feedback instead of creating new one
      existing.positive = createFeedBackDto.positive;
      existing.negative = createFeedBackDto.negative;
      return this.feedbackRepository.save(existing);
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedBackDto,
    });

    return this.feedbackRepository.save(feedback);
  }

  async findAllFeedbacks({
    page = 1,
    limit = 30,
    model_type,
    model_id,
    user_id,
    positive,
    negative,
    search,
  }: GetFeedbacksDto): Promise<FeedbackPaginator> {
    const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');

    if (model_type) {
      queryBuilder.andWhere('feedback.model_type = :model_type', {
        model_type,
      });
    }

    if (model_id) {
      queryBuilder.andWhere('feedback.model_id = :model_id', { model_id });
    }

    if (user_id) {
      queryBuilder.andWhere('feedback.user_id = :user_id', { user_id });
    }

    if (positive !== undefined) {
      queryBuilder.andWhere('feedback.positive = :positive', { positive });
    }

    if (negative !== undefined) {
      queryBuilder.andWhere('feedback.negative = :negative', { negative });
    }

    if (search) {
      queryBuilder.andWhere(
        'feedback.model_type LIKE :search OR feedback.model_id LIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('feedback.created_at', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/feedbacks?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async findFeedback(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async getFeedbacksByModel(
    model_type: string,
    model_id: string,
  ): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { model_type, model_id },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    updateFeedBackDto: UpdateFeedBackDto,
  ): Promise<Feedback> {
    const feedback = await this.findFeedback(id);

    // Check if both positive and negative are set
    if (updateFeedBackDto.positive && updateFeedBackDto.negative) {
      throw new BadRequestException(
        'Feedback cannot be both positive and negative',
      );
    }

    // Update fields
    if (updateFeedBackDto.positive !== undefined) {
      feedback.positive = updateFeedBackDto.positive;
    }

    if (updateFeedBackDto.negative !== undefined) {
      feedback.negative = updateFeedBackDto.negative;
    }

    if (updateFeedBackDto.model_type) {
      feedback.model_type = updateFeedBackDto.model_type;
    }

    if (updateFeedBackDto.model_id) {
      feedback.model_id = updateFeedBackDto.model_id;
    }

    if (updateFeedBackDto.user_id) {
      feedback.user_id = updateFeedBackDto.user_id;
    }

    return this.feedbackRepository.save(feedback);
  }

  async delete(id: number): Promise<CoreMutationOutput> {
    const feedback = await this.findFeedback(id);

    await this.feedbackRepository.remove(feedback);

    return {
      success: true,
      message: `Feedback with ID ${id} deleted successfully`,
    };
  }

  async getFeedbackStats(model_type: string, model_id: string): Promise<any> {
    const feedbacks = await this.feedbackRepository.find({
      where: { model_type, model_id },
    });

    const positive = feedbacks.filter((f) => f.positive).length;
    const negative = feedbacks.filter((f) => f.negative).length;
    const total = feedbacks.length;

    return {
      total,
      positive,
      negative,
      positive_percentage: total ? (positive / total) * 100 : 0,
      negative_percentage: total ? (negative / total) * 100 : 0,
    };
  }
}
