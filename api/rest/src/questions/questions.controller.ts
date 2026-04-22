// src/questions/questions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto, UpdateQuestionAnswerDto } from './dto/update-question.dto';
import { GetQuestionsDto, QuestionPaginator } from './dto/get-questions.dto';
import { Question, QuestionMutationResponse, FeedbackResponse } from './dto/question-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permission } from 'src/common/enums/enums';
import { Public } from 'src/common/decorators/public.decorator';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Request as ExpressRequest } from 'express';

@ApiTags('❓ Questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all questions',
    description: 'Retrieve paginated list of all questions (Public access)'
  })
  @ApiOkResponse({
    description: 'Questions retrieved successfully',
    type: QuestionPaginator
  })
  findAll(@Query() query: GetQuestionsDto): Promise<QuestionPaginator> {
    return this.questionService.findAllQuestions(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get question by ID',
    description: 'Retrieve a specific question by ID'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Question retrieved successfully',
    type: Question
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.questionService.findQuestion(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new question',
    description: 'Submit a question about a product (Authenticated users only)'
  })
  @ApiCreatedResponse({
    description: 'Question created successfully',
    type: QuestionMutationResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreateQuestionDto })
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Request() req: ExpressRequest & { user?: { id: number } },
  ): Promise<QuestionMutationResponse> {
    // If user is authenticated, use their ID
    if (req.user) {
      createQuestionDto.user_id = req.user.id;
    }
    return this.questionService.create(createQuestionDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update question',
    description: 'Update a question (Admin, Store Owner, Staff only)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Question updated successfully',
    type: QuestionMutationResponse
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateQuestionDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionMutationResponse> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Put(':id/answer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER, Permission.STAFF)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Answer a question',
    description: 'Add or update answer to a question (Admin, Store Owner, Staff only)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Answer added successfully',
    type: QuestionMutationResponse
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateQuestionAnswerDto })
  answerQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() answerDto: UpdateQuestionAnswerDto,
  ): Promise<QuestionMutationResponse> {
    return this.questionService.answerQuestion(id, answerDto.answer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Permission.SUPER_ADMIN, Permission.STORE_OWNER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete question',
    description: 'Permanently delete a question from the database (Admin, Store Owner only)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({ description: 'Question deleted successfully' })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.questionService.delete(id);
  }

  @Post(':id/positive-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add positive feedback',
    description: 'Add positive feedback to a question (Authenticated users)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Feedback added successfully',
    type: FeedbackResponse
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addPositiveFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { id: number } },
  ): Promise<FeedbackResponse> {
    return this.questionService.addPositiveFeedback(id, req.user.id);
  }

  @Post(':id/negative-feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add negative feedback',
    description: 'Add negative feedback to a question (Authenticated users)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Feedback added successfully',
    type: FeedbackResponse
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  addNegativeFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { id: number } },
  ): Promise<FeedbackResponse> {
    return this.questionService.addNegativeFeedback(id, req.user.id);
  }

  @Post(':id/abusive-report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report abusive question',
    description: 'Report a question as abusive (Authenticated users)'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Report submitted successfully',
    type: CoreMutationOutput
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  reportAbusive(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest & { user: { id: number } },
  ): Promise<CoreMutationOutput> {
    return this.questionService.reportAbusive(id, req.user.id);
  }
}