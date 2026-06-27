import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { BranchInventory } from './entities/branch-inventory.entity';
import { BranchTransfer } from './entities/branch-transfer.entity';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { ProductsModule } from '../products/products.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, BranchInventory, BranchTransfer, User]),
    ProductsModule,
  ],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
