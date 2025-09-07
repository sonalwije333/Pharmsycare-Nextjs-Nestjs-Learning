import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Faq])], // This makes the repository available
    controllers: [FaqsController],
    providers: [FaqsService],
    exports: [FaqsService],
})
export class FaqsModule {}