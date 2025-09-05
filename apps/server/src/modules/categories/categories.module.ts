// src/modules/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController, TopCategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { Type } from '../types/entities/type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Type])],
    controllers: [CategoriesController, TopCategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}