import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipTransferController } from './ownership-transfer.controller';
import { OwnershipTransferService } from './ownership-transfer.service';
import { OwnershipTransfer } from './entities/ownership-transfer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OwnershipTransfer])],
  controllers: [OwnershipTransferController],
  providers: [OwnershipTransferService],
  exports: [OwnershipTransferService],
})
export class OwnershipTransferModule {}