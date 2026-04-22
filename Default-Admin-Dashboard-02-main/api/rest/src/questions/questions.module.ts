// src/questions/questions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './questions.controller';
import { MyQuestionsController } from './my-questions.controller';
import { QuestionsService } from './questions.service';
import { MyQuestionsService } from './my-questions.service';
import { Question } from './entities/question.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Product, User, Shop]),
  ],
  controllers: [
    QuestionController,
    MyQuestionsController,
  ],
  providers: [
    QuestionsService,
    MyQuestionsService,
  ],
  exports: [
    QuestionsService,
    MyQuestionsService,
    TypeOrmModule,
  ],
})
export class QuestionsModule {}