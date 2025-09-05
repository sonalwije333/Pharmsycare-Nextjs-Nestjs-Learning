import { Module } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorsController, TopAuthorsController } from './authors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Author])],
    controllers: [AuthorsController, TopAuthorsController],
    providers: [AuthorsService],
    exports: [AuthorsService],
})
export class AuthorsModule {}