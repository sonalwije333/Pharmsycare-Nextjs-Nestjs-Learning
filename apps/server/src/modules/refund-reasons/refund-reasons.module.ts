import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundReasonsController } from './refund-reasons.controller';
import { RefundReasonsService } from './refund-reasons.service';
import { RefundReason } from './entities/refund-reasons.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RefundReason])],
    controllers: [RefundReasonsController],
    providers: [RefundReasonsService],
    exports: [RefundReasonsService],
})
export class RefundReasonsModule {}