import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFeedbacksDto, FeedbackPaginator } from './dto/get-feedbacks.dto';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { paginate } from '../common/pagination/paginate';
import { QueryFeedbacksOrderByColumn } from './dto/get-feedbacks.dto';
import {SortOrder} from "../common/dto/generic-conditions.dto";

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
    ) {}

    async create(createFeedBackDto: CreateFeedBackDto): Promise<Feedback> {
        const feedback = this.feedbackRepository.create({
            ...createFeedBackDto,
            positive: createFeedBackDto.positive || false,
            negative: createFeedBackDto.negative || false,
        });

        return await this.feedbackRepository.save(feedback);
    }

    async findAllFeedBacks({
                               page = 1,
                               limit = 30,
                               model_type,
                               model_id,
                               user_id,
                               positive,
                               negative,
                               orderBy,
                               sortOrder = SortOrder.DESC
                           }: GetFeedbacksDto): Promise<FeedbackPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

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

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`feedback.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('feedback.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/feedbacks?limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryFeedbacksOrderByColumn): string {
        switch (orderBy) {
            case QueryFeedbacksOrderByColumn.MODEL_TYPE:
                return 'model_type';
            case QueryFeedbacksOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryFeedbacksOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findFeedBack(id: number): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        return feedback;
    }

    async update(id: number, updateFeedBackDto: UpdateFeedBackDto): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOneBy({ id });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        const updated = this.feedbackRepository.merge(feedback, updateFeedBackDto);
        return this.feedbackRepository.save(updated);
    }

    async delete(id: number): Promise<void> {
        const feedback = await this.feedbackRepository.findOneBy({ id });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${id} not found`);
        }

        await this.feedbackRepository.remove(feedback);
    }
}