import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    Put,
    Delete,
    UseGuards,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import { MyQuestionsService } from './my-questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsDto, QuestionPaginator } from './dto/get-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { Question } from './entities/question.entity';
import { Request } from 'express';

// Define a custom interface that extends Request with user property
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        // Add other user properties as needed
        [key: string]: any;
    };
}

@ApiTags('My Questions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/my-questions')
export class MyQuestionsController {
    constructor(private myQuestionService: MyQuestionsService) {}

    @Get()
    @ApiOperation({ summary: 'Get my questions', description: 'Retrieves questions asked by the authenticated user.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'answer', required: false, type: String, description: 'Answer filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'QUESTION', 'ANSWER'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Questions retrieved successfully', type: QuestionPaginator })
    async findAll(@Query() query: GetQuestionsDto, @Req() req: AuthenticatedRequest): Promise<QuestionPaginator> {
        const userId = req.user.id; // Now TypeScript knows user exists
        return this.myQuestionService.findMyQuestions(query, userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get my question by ID', description: 'Retrieves a specific question asked by the authenticated user.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question retrieved successfully', type: Question })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async find(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<Question> {
        const userId = req.user.id;
        return this.myQuestionService.findMyQuestion(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new question', description: 'Creates a new question for the authenticated user.' })
    @ApiResponse({ status: 201, description: 'Question successfully created', type: Question })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    async create(@Body() createQuestionDto: CreateQuestionDto, @Req() req: AuthenticatedRequest): Promise<Question> {
        const userId = req.user.id;
        return this.myQuestionService.create(createQuestionDto, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update my question', description: 'Updates a question asked by the authenticated user.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question updated successfully', type: Question })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateQuestionDto: UpdateQuestionDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<Question> {
        const userId = req.user.id;
        return this.myQuestionService.update(id, updateQuestionDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete my question', description: 'Deletes a question asked by the authenticated user.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question deleted successfully' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<void> {
        const userId = req.user.id;
        return this.myQuestionService.delete(id, userId);
    }
}