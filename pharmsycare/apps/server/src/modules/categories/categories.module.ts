import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // 👈 register entity here
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], // if other modules need this service
})
export class CategoriesModule {}
