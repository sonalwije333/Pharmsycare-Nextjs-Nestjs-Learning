import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundPoliciesController } from './refund-policies.controller';
import { RefundPoliciesService } from './refund-policies.service';
import { RefundPolicy } from './entities/refund-policies.entity';
import { Shop } from '../shops/entites/shop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RefundPolicy, Shop])],
    controllers: [RefundPoliciesController],
    providers: [RefundPoliciesService],
    exports: [RefundPoliciesService],
})
export class RefundPoliciesModule {}