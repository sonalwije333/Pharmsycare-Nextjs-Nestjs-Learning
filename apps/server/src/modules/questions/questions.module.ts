import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { QuestionController } from './questions.controller';
import { MyQuestionsController } from './my-questions.controller';
import { QuestionService } from './questions.service';
import { MyQuestionsService } from './my-questions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Question, Product, User])],
    controllers: [QuestionController, MyQuestionsController],
    providers: [QuestionService, MyQuestionsService],
    exports: [QuestionService, MyQuestionsService],
})
export class QuestionModule {}