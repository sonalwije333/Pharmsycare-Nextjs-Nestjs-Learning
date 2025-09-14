import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermsAndConditionsController } from './terms-and-conditions.controller';
import { TermsAndConditionsService } from './terms-and-conditions.service';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TermsAndConditions])],
    controllers: [TermsAndConditionsController],
    providers: [TermsAndConditionsService],
    exports: [TermsAndConditionsService],
})
export class TermsAndConditionsModule {}