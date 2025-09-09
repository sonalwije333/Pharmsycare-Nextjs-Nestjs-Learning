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
} from '@nestjs/common';
import { QuestionService } from './questions.service';
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
import { PermissionType } from '../../common/enums/enums';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Question } from './entities/question.entity';

@ApiTags('Questions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/questions')
export class QuestionController {
    constructor(private questionService: QuestionService) {}

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get all questions', description: 'Retrieves a list of questions with filtering and pagination.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
    @ApiQuery({ name: 'answer', required: false, type: String, description: 'Answer filter' })
    @ApiQuery({ name: 'product_id', required: false, type: Number, description: 'Product ID filter' })
    @ApiQuery({ name: 'user_id', required: false, type: Number, description: 'User ID filter' })
    @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Shop ID filter' })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['CREATED_AT', 'UPDATED_AT', 'QUESTION', 'ANSWER'], description: 'Order by column' })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
    @ApiResponse({ status: 200, description: 'Questions retrieved successfully', type: QuestionPaginator })
    async findAll(@Query() query: GetQuestionsDto): Promise<QuestionPaginator> {
        return this.questionService.findAllQuestions(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Get question by ID', description: 'Retrieves a specific question by ID.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question retrieved successfully', type: Question })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async find(@Param('id', ParseIntPipe) id: number): Promise<Question> {
        return this.questionService.findQuestion(id);
    }

    @Post()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF, PermissionType.CUSTOMER)
    @ApiOperation({ summary: 'Create a new question', description: 'Creates a new question.' })
    @ApiResponse({ status: 201, description: 'Question successfully created', type: Question })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    async create(@Body() createQuestionDto: CreateQuestionDto): Promise<Question> {
        return this.questionService.create(createQuestionDto);
    }

    @Put(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Update question', description: 'Updates an existing question.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question updated successfully', type: Question })
    @ApiResponse({ status: 400, description: 'Bad request - invalid input data' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateQuestionDto: UpdateQuestionDto,
    ): Promise<Question> {
        return this.questionService.update(id, updateQuestionDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Delete question', description: 'Deletes a question.' })
    @ApiParam({ name: 'id', description: 'Question ID', type: Number })
    @ApiResponse({ status: 200, description: 'Question deleted successfully' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.questionService.delete(id);
    }
}