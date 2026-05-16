import { Module } from '@nestjs/common';
import { LegacyNewslettersController, NewslettersController } from './newsletters.controller';
import { NewslettersService } from './newsletters.service';

@Module({
  controllers: [NewslettersController, LegacyNewslettersController],
  providers: [NewslettersService],
  exports: [NewslettersService],
})
export class NewslettersModule {}