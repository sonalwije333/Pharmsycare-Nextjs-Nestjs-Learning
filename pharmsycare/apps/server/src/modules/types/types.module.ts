import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Type])], // 👈 register entity here
  controllers: [TypesController],
  providers: [TypesService],
  exports: [TypesService], // if other modules need this service
})
export class TypesModule {}
