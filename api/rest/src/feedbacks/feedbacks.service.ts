import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { SortOrder, Permission } from '../common/enums/enums';
import { FeedbackOrderByColumn, ModelType } from 'src/common/enums/model-type.enum';


@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createFeedBackDto: CreateFeedBackDto): Promise<Feedback> {
    // Validate positive and negative are not both true
    if (createFeedBackDto.positive && createFeedBackDto.negative) {
      throw new BadRequestException('Feedback cannot be both positive and negative');
    }

    // Check if user already gave feedback for this model
    const existing = await this.feedbackRepository.findOne({
      where: {
        user_id: createFeedBackDto.user_id,
        model_type: createFeedBackDto.model_type,
        model_id: createFeedBackDto.model_id,
      },
    });

    // Update existing feedback instead of creating new one
    if (existing) {
      existing.positive = createFeedBackDto.positive;
      existing.negative = createFeedBackDto.negative;
      return this.feedbackRepository.save(existing);
    }

    // Create new feedback
    const feedback = this.feedbackRepository.create(createFeedBackDto);
    return this.feedbackRepository.save(feedback);
  }

  async findAllFeedbacks({
    page = 1,
    limit = 15,
    model_type,
    model_id,
    user_id,
    positive,
    negative,
    search,
    orderBy = FeedbackOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetFeedbacksDto): Promise<FeedbackPaginator> {
    const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');

    // Apply filters
    if (model_type) {
      queryBuilder.andWhere('feedback.model_type = :model_type', { model_type });
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
        '(feedback.model_type LIKE :search OR feedback.model_id LIKE :search OR feedback.user_id LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    let orderColumn: string;
    switch (orderBy) {
      case FeedbackOrderByColumn.MODEL_TYPE:
        orderColumn = 'feedback.model_type';
        break;
      case FeedbackOrderByColumn.MODEL_ID:
        orderColumn = 'feedback.model_id';
        break;
      case FeedbackOrderByColumn.UPDATED_AT:
        orderColumn = 'feedback.updated_at';
        break;
      default:
        orderColumn = 'feedback.created_at';
    }
    
    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    // Apply pagination
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

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async getFeedbacksByModel(model_type: ModelType, model_id: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { model_type, model_id },
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: number,
    updateFeedBackDto: UpdateFeedBackDto,
    user: any,
  ): Promise<Feedback> {
    const feedback = await this.findOne(id);

    // Check permissions
    const userPermissions = user?.permissions || [];
    const isAdmin = userPermissions.includes(Permission.SUPER_ADMIN);
    const userId = user?.id?.toString() || user?._id?.toString();
    const isOwner = feedback.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to update this feedback');
    }

    // Validate positive and negative are not both true
    if (updateFeedBackDto.positive && updateFeedBackDto.negative) {
      throw new BadRequestException('Feedback cannot be both positive and negative');
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

  async remove(id: number, user: any): Promise<CoreMutationOutput> {
    const feedback = await this.findOne(id);

    // Check permissions
    const userPermissions = user?.permissions || [];
    const isAdmin = userPermissions.includes(Permission.SUPER_ADMIN);
    const userId = user?.id?.toString() || user?._id?.toString();
    const isOwner = feedback.user_id === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to delete this feedback');
    }

    // Soft delete
    await this.feedbackRepository.softDelete(id);

    return {
      success: true,
      message: `Feedback with ID ${id} deleted successfully`,
    };
  }

  async getFeedbackStats(model_type: ModelType, model_id: string): Promise<any> {
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
      positive_percentage: total ? Number(((positive / total) * 100).toFixed(2)) : 0,
      negative_percentage: total ? Number(((negative / total) * 100).toFixed(2)) : 0,
    };
  }
}