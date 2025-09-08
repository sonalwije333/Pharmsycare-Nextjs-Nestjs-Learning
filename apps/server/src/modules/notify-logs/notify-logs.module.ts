import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyLogsController } from './notify-logs.controller';
import { NotifyLogsService } from './notify-logs.service';
import { NotifyLogs } from './entities/notify-logs.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotifyLogs])],
    controllers: [NotifyLogsController],
    providers: [NotifyLogsService],
    exports: [NotifyLogsService],
})
export class NotifyLogsModule {}