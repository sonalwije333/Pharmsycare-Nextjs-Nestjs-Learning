import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawsService } from './withdraws.service';
import { WithdrawsController } from './withdraws.controller';
import { Withdraw } from './entities/withdraw.entity';
import { Shop } from '../shops/entites/shop.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Withdraw, Shop]), // Add both entities here
    ],
    controllers: [WithdrawsController],
    providers: [WithdrawsService],
    exports: [WithdrawsService], // Optional: if you want to use this service in other modules
})
export class WithdrawsModule {}