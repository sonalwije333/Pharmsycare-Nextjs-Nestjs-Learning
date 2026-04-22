// src/withdraws/withdraws.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawsService } from './withdraws.service';
import { WithdrawsController } from './withdraws.controller';
import { Withdraw } from './entities/withdraw.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw, Shop])],
  controllers: [WithdrawsController],
  providers: [WithdrawsService],
  exports: [WithdrawsService],
})
export class WithdrawsModule {}