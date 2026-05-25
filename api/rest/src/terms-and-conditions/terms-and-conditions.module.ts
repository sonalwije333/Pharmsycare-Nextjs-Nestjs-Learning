// terms-and-conditions/terms-and-conditions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApproveTermsAndConditionController,
  DisapproveTermsAndConditionController,
  TermsAndConditionsController,
} from './terms-and-conditions.controller';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import { TermsAndConditionsService } from './terms-and-conditions.service';

@Module({
  imports: [TypeOrmModule.forFeature([TermsAndConditions])],
  controllers: [
    TermsAndConditionsController,
    DisapproveTermsAndConditionController,
    ApproveTermsAndConditionController,
  ],
  providers: [TermsAndConditionsService],
  exports: [TermsAndConditionsService],
})
export class TermsAndConditionsModule {}