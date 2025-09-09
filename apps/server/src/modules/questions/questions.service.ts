import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Question } from './entities/question.entity';
import { GetQuestionsDto, QuestionPaginator } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

import { SortOrder } from '../common/dto/generic-conditions.dto';
import {QueryQuestionsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAllQuestions({
                               page = 1,
                               limit = 10,
                               search,
                               answer,
                               product_id,
                               user_id,
                               shop_id,
                               orderBy,
                               sortOrder = SortOrder.DESC
                           }: GetQuestionsDto): Promise<QuestionPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.questionRepository.createQueryBuilder('question')
            .leftJoinAndSelect('question.product', 'product')
            .leftJoinAndSelect('question.user', 'user');

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

        if (product_id) {
            queryBuilder.andWhere('question.product_id = :product_id', { product_id });
        }

        if (user_id) {
            queryBuilder.andWhere('question.user_id = :user_id', { user_id });
        }

        if (shop_id) {
            queryBuilder.andWhere('question.shop_id = :shop_id', { shop_id });
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

        const url = `/questions?search=${search ?? ''}&answer=${answer ?? ''}&limit=${limit}`;
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

    async findQuestion(id: number): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['product', 'user'],
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        return question;
    }

    async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
        // Verify product exists
        // const product = await this.productRepository.findOne({
        //     where: { id: createQuestionDto.product_id },
        // });
        //
        // if (!product) {
        //     throw new NotFoundException(`Product with ID ${createQuestionDto.product_id} not found`);
        // }

        // Verify user exists
        const user = await this.userRepository.findOne({
            where: { id: createQuestionDto.user_id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createQuestionDto.user_id} not found`);
        }

        const question = this.questionRepository.create({
            ...createQuestionDto,
            positive_feedbacks_count: 0,
            negative_feedbacks_count: 0,
        });

        return await this.questionRepository.save(question);
    }

    async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['product', 'user'],
        });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        // Verify product exists if product_id is being updated
        if (updateQuestionDto.product_id) {
            // const product = await this.productRepository.findOne({
            //     where: { id: updateQuestionDto.product_id },
            // });
            //
            // if (!product) {
            //     throw new NotFoundException(`Product with ID ${updateQuestionDto.product_id} not found`);
            // }
        }

        // Verify user exists if user_id is being updated
        if (updateQuestionDto.user_id) {
            const user = await this.userRepository.findOne({
                where: { id: updateQuestionDto.user_id },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${updateQuestionDto.user_id} not found`);
            }
        }

        const updated = this.questionRepository.merge(question, updateQuestionDto);
        return this.questionRepository.save(updated);
    }

    async delete(id: number): Promise<void> {
        const question = await this.questionRepository.findOneBy({ id });

        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }

        await this.questionRepository.remove(question);
    }
}