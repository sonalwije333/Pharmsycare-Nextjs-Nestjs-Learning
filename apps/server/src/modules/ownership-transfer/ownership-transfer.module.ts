import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '../shops/entites/shop.entity';
import { User } from '../users/entities/user.entity';
import { OwnershipTransferController } from './ownership-transfer.controller';
import { OwnershipTransferService } from './ownership-transfer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User])],
  controllers: [OwnershipTransferController],
  providers: [OwnershipTransferService],
})
export class OwnershipTransferModule {}