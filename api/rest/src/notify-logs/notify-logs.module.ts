// notify-logs/notify-logs.module.ts
import { Module } from '@nestjs/common';
import { NotifyLogsController } from './notify-logs.controller';
import { NotifyLogsService } from './notify-logs.service';

@Module({
  controllers: [NotifyLogsController],
  providers: [NotifyLogsService],
  exports: [NotifyLogsService],
})
export class NotifyLogsModule {}