// src/questions/my-questions.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GetMyQuestionsDto, QuestionPaginator, QueryQuestionsOrderByColumn } from './dto/get-questions.dto';
import { QuestionMutationResponse } from './dto/question-response.dto';
import { paginate } from 'src/common/pagination/paginate';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MyQuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findMyQuestions({
    limit = 10,
    page = 1,
    orderBy = QueryQuestionsOrderByColumn.CREATED_AT,
    sortedBy = 'DESC',
    search,
  }: GetMyQuestionsDto, userId: number): Promise<QuestionPaginator> {
    const query = this.questionRepository.createQueryBuilder('question')
      .leftJoinAndSelect('question.product', 'product')
      .leftJoinAndSelect('question.user', 'user')
      .where('question.user_id = :userId', { userId })
      .andWhere('question.deleted_at IS NULL');

    if (search) {
      query.andWhere('(question.question LIKE :search OR product.name LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const orderByColumn = orderBy === QueryQuestionsOrderByColumn.QUESTION ? 'question.question' : `question.${orderBy}`;
    query.orderBy(orderByColumn, sortedBy);
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    const url = `/my-questions?limit=${limit}&orderBy=${orderBy}&sortedBy=${sortedBy}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
    };
  }

  async findMyQuestion(id: number, userId: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id, deleted_at: null },
      relations: ['product', 'user'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    if (question.user_id !== userId) {
      throw new ForbiddenException('You do not have permission to view this question');
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

    const question = this.questionRepository.create({
      ...createQuestionDto,
      positive_feedbacks_count: 0,
      negative_feedbacks_count: 0,
      abusive_reports_count: 0,
    });

    const savedQuestion = await this.questionRepository.save(question);

    const loadedQuestion = await this.questionRepository.findOne({
      where: { id: savedQuestion.id },
      relations: ['product', 'user'],
    });

    return {
      success: true,
      message: 'Question created successfully',
      question: loadedQuestion,
    };
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto, userId: number): Promise<QuestionMutationResponse> {
    const question = await this.findMyQuestion(id, userId);

    if (updateQuestionDto.question) {
      question.question = updateQuestionDto.question;
    }

    const updatedQuestion = await this.questionRepository.save(question);

    const loadedQuestion = await this.questionRepository.findOne({
      where: { id: updatedQuestion.id },
      relations: ['product', 'user'],
    });

    return {
      success: true,
      message: 'Question updated successfully',
      question: loadedQuestion,
    };
  }

  async delete(id: number, userId: number): Promise<void> {
    const question = await this.findMyQuestion(id, userId);

    await this.questionRepository.delete(question.id);
  }
}