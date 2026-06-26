// src/questions/questions.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, FindOptionsWhere, IsNull } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GetQuestionsDto, QuestionPaginator, QueryQuestionsOrderByColumn } from './dto/get-questions.dto';
import { QuestionMutationResponse, FeedbackResponse } from './dto/question-response.dto';
import { paginate } from 'src/common/pagination/paginate';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async findAllQuestions({
    limit = 10,
    page = 1,
    orderBy = QueryQuestionsOrderByColumn.CREATED_AT,
    sortedBy = 'DESC',
    search,
    product_id,
    user_id,
    shop_id,
    answer_status = 'all',
    answer,
  }: GetQuestionsDto): Promise<QuestionPaginator> {
    const query = this.questionRepository.createQueryBuilder('question')
      .leftJoinAndSelect('question.product', 'product')
      .leftJoinAndSelect('question.user', 'user');

    // Apply filters
    if (search) {
      query.andWhere('(question.question LIKE :search OR question.answer LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (product_id) {
      query.andWhere('question.product_id = :product_id', { product_id });
    }

    if (user_id) {
      query.andWhere('question.user_id = :user_id', { user_id });
    }

    if (shop_id) {
      query.andWhere('question.shop_id = :shop_id', { shop_id });
    }

    const normalizedAnswerStatus =
      answer_status !== 'all'
        ? answer_status
        : answer === 'null'
          ? 'unanswered'
          : answer === 'notnull'
            ? 'answered'
            : 'all';

    if (normalizedAnswerStatus === 'answered') {
      query.andWhere('question.answer IS NOT NULL');
    } else if (normalizedAnswerStatus === 'unanswered') {
      query.andWhere('question.answer IS NULL');
    }

    // Apply soft delete filter (exclude soft-deleted questions)
    query.andWhere('question.deleted_at IS NULL');

    // Apply sorting
    const orderByColumn = orderBy === QueryQuestionsOrderByColumn.QUESTION ? 'question.question' : `question.${orderBy}`;
    const sortDirection = (sortedBy || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(orderByColumn, sortDirection);

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    const url = `/questions?limit=${limit}&orderBy=${orderBy}&sortedBy=${sortedBy}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async findQuestion(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['product', 'user'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async create(createQuestionDto: CreateQuestionDto): Promise<QuestionMutationResponse> {
    // Verify product exists
    const product = await this.productRepository.findOne({
      where: { id: createQuestionDto.product_id }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createQuestionDto.product_id} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: createQuestionDto.user_id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createQuestionDto.user_id} not found`);
    }

    const question = this.questionRepository.create({
      ...createQuestionDto,
      positive_feedbacks_count: 0,
      negative_feedbacks_count: 0,
      abusive_reports_count: 0,
    });

    const savedQuestion = await this.questionRepository.save(question);

    const loadedQuestion = await this.findQuestion(savedQuestion.id);

    return {
      success: true,
      message: 'Question created successfully',
      question: loadedQuestion,
    };
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<QuestionMutationResponse> {
    const question = await this.findQuestion(id);

    // Only allow updating question text (not answer here)
    if (updateQuestionDto.question) {
      question.question = updateQuestionDto.question;
    }

    const updatedQuestion = await this.questionRepository.save(question);
    const loadedQuestion = await this.findQuestion(updatedQuestion.id);

    return {
      success: true,
      message: 'Question updated successfully',
      question: loadedQuestion,
    };
  }

  async answerQuestion(id: number, answer: string): Promise<QuestionMutationResponse> {
    const question = await this.findQuestion(id);

    question.answer = answer;
    const updatedQuestion = await this.questionRepository.save(question);
    const loadedQuestion = await this.findQuestion(updatedQuestion.id);

    return {
      success: true,
      message: 'Answer added successfully',
      question: loadedQuestion,
    };
  }

  async delete(id: number): Promise<void> {
    const question = await this.findQuestion(id);

    await this.questionRepository.delete(question.id);
  }

  async addPositiveFeedback(questionId: number, userId: number): Promise<FeedbackResponse> {
    const question = await this.findQuestion(questionId);

    // TODO: Implement feedback tracking to prevent multiple feedbacks from same user
    // This would require a separate feedbacks table

    question.positive_feedbacks_count += 1;
    await this.questionRepository.save(question);

    return {
      success: true,
      message: 'Positive feedback added successfully',
      counts: {
        positive: question.positive_feedbacks_count,
        negative: question.negative_feedbacks_count,
        total: question.positive_feedbacks_count + question.negative_feedbacks_count,
      },
    };
  }

  async addNegativeFeedback(questionId: number, userId: number): Promise<FeedbackResponse> {
    const question = await this.findQuestion(questionId);

    question.negative_feedbacks_count += 1;
    await this.questionRepository.save(question);

    return {
      success: true,
      message: 'Negative feedback added successfully',
      counts: {
        positive: question.positive_feedbacks_count,
        negative: question.negative_feedbacks_count,
        total: question.positive_feedbacks_count + question.negative_feedbacks_count,
      },
    };
  }

  async reportAbusive(questionId: number, userId: number): Promise<CoreMutationOutput> {
    const question = await this.findQuestion(questionId);

    question.abusive_reports_count += 1;
    await this.questionRepository.save(question);

    // TODO: Implement notification to admin when report count exceeds threshold

    return {
      success: true,
      message: 'Report submitted successfully. Our team will review this question.',
    };
  }
}