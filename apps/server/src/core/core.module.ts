import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { DatabaseModule } from './database/database.module';

@Module({
  providers: [CoreService],
  imports: [DatabaseModule]
})
export class CoreModule {}
