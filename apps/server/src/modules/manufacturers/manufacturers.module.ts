import { Module } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { ManufacturersController } from './manufacturers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacturer } from './entities/manufacturer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Manufacturer])],
    controllers: [ManufacturersController],
    providers: [ManufacturersService],
    exports: [ManufacturersService],
})
export class ManufacturersModule {}