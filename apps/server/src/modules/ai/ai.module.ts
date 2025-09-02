import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiTask } from './entities/ai.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiTask, User])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}