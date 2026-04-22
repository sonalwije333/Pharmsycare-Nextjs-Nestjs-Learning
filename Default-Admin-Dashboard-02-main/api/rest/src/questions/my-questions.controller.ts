// src/questions/my-questions.controller.ts
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
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MyQuestionsService } from './my-questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GetMyQuestionsDto, QuestionPaginator } from './dto/get-questions.dto';
import { Question, QuestionMutationResponse } from './dto/question-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('👤 My Questions')
@Controller('my-questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MyQuestionsController {
  constructor(private readonly myQuestionService: MyQuestionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get my questions',
    description: 'Retrieve paginated list of questions asked by the authenticated user'
  })
  @ApiOkResponse({
    description: 'My questions retrieved successfully',
    type: QuestionPaginator
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findAll(@Query() query: GetMyQuestionsDto, @Request() req): Promise<QuestionPaginator> {
    return this.myQuestionService.findMyQuestions(query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get my question by ID',
    description: 'Retrieve a specific question asked by the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Question retrieved successfully',
    type: Question
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Question> {
    return this.myQuestionService.findMyQuestion(id, req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new question',
    description: 'Submit a question about a product'
  })
  @ApiCreatedResponse({
    description: 'Question created successfully',
    type: QuestionMutationResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: CreateQuestionDto })
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req): Promise<QuestionMutationResponse> {
    createQuestionDto.user_id = req.user.id;
    return this.myQuestionService.create(createQuestionDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update my question',
    description: 'Update a question asked by the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({
    description: 'Question updated successfully',
    type: QuestionMutationResponse
  })
  @ApiNotFoundResponse({ description: 'Question not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiBody({ type: UpdateQuestionDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Request() req,
  ): Promise<QuestionMutationResponse> {
    return this.myQuestionService.update(id, updateQuestionDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete my question',
    description: 'Permanently delete a question asked by the authenticated user'
  })
  @ApiParam({ name: 'id', description: 'Question ID', type: Number })
  @ApiOkResponse({ description: 'Question deleted successfully' })
  @ApiNotFoundResponse({ description: 'Question not found or not owned by user' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.myQuestionService.delete(id, req.user.id);
  }
}