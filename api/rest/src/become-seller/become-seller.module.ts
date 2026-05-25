// become-seller/become-seller.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BecomeSellerController } from './become-seller.controller';
import { BecomeSellerService } from './become-seller.service';
import { BecomeSeller } from './entities/become-seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BecomeSeller])],
  controllers: [BecomeSellerController],
  providers: [BecomeSellerService],
  exports: [BecomeSellerService],
})
export class BecomeSellerModule {}
