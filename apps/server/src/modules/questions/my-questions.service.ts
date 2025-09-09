import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Question } from './entities/question.entity';
import { GetQuestionsDto, QuestionPaginator } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

import { SortOrder } from '../common/dto/generic-conditions.dto';
import {QueryQuestionsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class MyQuestionsService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {}

    async findMyQuestions({
                              page = 1,
                              limit = 8,
                              search,
                              answer,
                              orderBy,
                              sortOrder = SortOrder.DESC
                          }: GetQuestionsDto, userId: number): Promise<QuestionPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.questionRepository.createQueryBuilder('question')
            .leftJoinAndSelect('question.product', 'product')
            .leftJoinAndSelect('question.user', 'user')
            .where('question.user_id = :userId', { userId });

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(question.question ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (answer) {
            queryBuilder.andWhere('question.answer ILIKE :answer', {
                answer: `%${answer}%`,
            });
        }

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`question.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('question.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/my-questions?with=user&orderBy=created_at&sortedBy=desc`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryQuestionsOrderByColumn): string {
        switch (orderBy) {
            case QueryQuestionsOrderByColumn.QUESTION:
                return 'question';
            case QueryQuestionsOrderByColumn.ANSWER:
                return 'answer';
            case QueryQuestionsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryQuestionsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findMyQuestion(id: number, userId: number): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id, user_id: userId },
            relations: ['product', 'user'],
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found or you don't have permission to access it`);
        }

        return question;
    }

    async create(createQuestionDto: CreateQuestionDto, userId: number): Promise<Question> {
        const question = this.questionRepository.create({
            ...createQuestionDto,
            user_id: userId, // Ensure the question belongs to the authenticated user
            positive_feedbacks_count: 0,
            negative_feedbacks_count: 0,
        });

        return await this.questionRepository.save(question);
    }

    async update(id: number, updateQuestionDto: UpdateQuestionDto, userId: number): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id, user_id: userId },
            relations: ['product', 'user'],
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found or you don't have permission to update it`);
        }

        const updated = this.questionRepository.merge(question, updateQuestionDto);
        return this.questionRepository.save(updated);
    }

    async delete(id: number, userId: number): Promise<void> {
        const question = await this.questionRepository.findOne({
            where: { id, user_id: userId },
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found or you don't have permission to delete it`);
        }

        await this.questionRepository.remove(question);
    }
}