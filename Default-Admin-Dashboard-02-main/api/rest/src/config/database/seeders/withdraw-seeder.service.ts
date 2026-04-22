// src/config/database/seeders/withdraw-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Withdraw, WithdrawStatus } from '../../../withdraws/entities/withdraw.entity';
import { Shop } from '../../../shops/entities/shop.entity';

@Injectable()
export class WithdrawSeederService {
  private readonly logger = new Logger(WithdrawSeederService.name);

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // Withdraw data from the provided JSON
  private readonly withdrawData = [
    {
      id: 2,
      shop_id: 3,
      amount: 10,
      payment_method: 'cash',
      status: 'pending',
      details: 'iojiojio',
      note: 'joijo',
    },
    {
      id: 1,
      shop_id: 3,
      amount: 300,
      payment_method: 'Bkash',
      status: 'approved',
      details: '01679373064\nBkash Personal',
      note: 'Kinldy Send My Balance before next week.',
    },
  ];

  // Additional withdraw templates for generating more data
  private readonly paymentMethods = ['Bkash', 'Nagad', 'Rocket', 'Bank Transfer', 'Cash', 'PayPal'];
  private readonly notes = [
    'Please process this withdrawal request.',
    'Urgent withdrawal needed.',
    'Monthly withdrawal request.',
    'Kindly send my balance before next week.',
    'Withdrawal for shop expenses.',
    'Requesting payout for completed orders.',
  ];
  private readonly detailsTemplates = [
    '01712345678\nBkash Personal',
    '01812345678\nNagad Merchant',
    '01612345678\nRocket Personal',
    'Bank Account: 123456789\nBank: City Bank',
    'PayPal: seller@example.com',
  ];

  constructor(
    @InjectRepository(Withdraw)
    private readonly withdrawRepository: Repository<Withdraw>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async seed() {
    try {
      this.logger.log('🌱 Seeding withdraws...');

      const shops = await this.shopRepository.find();
      if (shops.length === 0) {
        this.logger.warn('No shops found. Please seed shops first.');
        return;
      }

      // Clear existing withdraws
      await this.clear();

      const withdraws: Withdraw[] = [];

      // Seed the provided withdraw data
      for (const withdrawItem of this.withdrawData) {
        const shop = shops.find(s => s.id === withdrawItem.shop_id);
        if (shop) {
          const withdraw = this.withdrawRepository.create({
            shop_id: withdrawItem.shop_id,
            amount: withdrawItem.amount,
            payment_method: withdrawItem.payment_method,
            status: withdrawItem.status as WithdrawStatus,
            details: withdrawItem.details,
            note: withdrawItem.note,
          });
          withdraws.push(withdraw);
        }
      }

      // Generate additional random withdraws for each shop
      for (const shop of shops) {
        // Each shop gets 1-4 withdraw requests
        const withdrawCount = Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < withdrawCount; i++) {
          const statuses = Object.values(WithdrawStatus);
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          const withdraw = this.withdrawRepository.create({
            shop_id: shop.id,
            amount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
            payment_method: this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)],
            status: randomStatus,
            details: this.detailsTemplates[Math.floor(Math.random() * this.detailsTemplates.length)],
            note: this.notes[Math.floor(Math.random() * this.notes.length)],
          });
          withdraws.push(withdraw);
        }
      }

      await this.withdrawRepository.save(withdraws);
      this.logger.log(`✅ Created ${withdraws.length} withdraw requests`);

      await this.printStats();

    } catch (error) {
      this.logger.error(`Failed to seed withdraws: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clear() {
    try {
      await this.withdrawRepository.clear();
      this.logger.log('🧹 Cleared all withdraws');
    } catch (error) {
      this.logger.error(`Failed to clear withdraws: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async seedByShopId(shopId: number) {
    try {
      this.logger.log(`🌱 Seeding withdraws for shop ${shopId}...`);

      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) {
        this.logger.warn(`Shop with ID ${shopId} not found.`);
        return;
      }

      // Clear existing withdraws for this shop
      await this.withdrawRepository.delete({ shop_id: shopId });

      const withdrawCount = Math.floor(Math.random() * 5) + 2;
      const withdraws: Withdraw[] = [];

      for (let i = 0; i < withdrawCount; i++) {
        const statuses = Object.values(WithdrawStatus);
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        const withdraw = this.withdrawRepository.create({
          shop_id: shop.id,
          amount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
          payment_method: this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)],
          status: randomStatus,
          details: this.detailsTemplates[Math.floor(Math.random() * this.detailsTemplates.length)],
          note: this.notes[Math.floor(Math.random() * this.notes.length)],
        });
        withdraws.push(withdraw);
      }

      await this.withdrawRepository.save(withdraws);
      this.logger.log(`✅ Created ${withdraws.length} withdraw requests for shop ${shopId}`);

    } catch (error) {
      this.logger.error(`Failed to seed withdraws for shop ${shopId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async seedByStatus(status: string) {
    try {
      this.logger.log(`🌱 Seeding withdraws with status ${status}...`);

      const shops = await this.shopRepository.find();
      if (shops.length === 0) {
        this.logger.warn('No shops found.');
        return;
      }

      const withdraws: Withdraw[] = [];
      const targetStatus = status as WithdrawStatus;

      for (const shop of shops) {
        if (Math.random() > 0.5) continue;

        const withdraw = this.withdrawRepository.create({
          shop_id: shop.id,
          amount: parseFloat((Math.random() * 500 + 50).toFixed(2)),
          payment_method: this.paymentMethods[Math.floor(Math.random() * this.paymentMethods.length)],
          status: targetStatus,
          details: this.detailsTemplates[Math.floor(Math.random() * this.detailsTemplates.length)],
          note: this.notes[Math.floor(Math.random() * this.notes.length)],
        });
        withdraws.push(withdraw);
      }

      await this.withdrawRepository.save(withdraws);
      this.logger.log(`✅ Created ${withdraws.length} withdraw requests with status ${status}`);

    } catch (error) {
      this.logger.error(`Failed to seed withdraws with status ${status}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clearByShopId(shopId: number) {
    try {
      await this.withdrawRepository.delete({ shop_id: shopId });
      this.logger.log(`✅ Cleared withdraws for shop ${shopId}`);
    } catch (error) {
      this.logger.error(`Failed to clear withdraws for shop ${shopId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clearByStatus(status: string) {
    try {
      await this.withdrawRepository.delete({ status: status as WithdrawStatus });
      this.logger.log(`✅ Cleared withdraws with status ${status}`);
    } catch (error) {
      this.logger.error(`Failed to clear withdraws with status ${status}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async getStats() {
    const total = await this.withdrawRepository.count();

    const statusStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .groupBy('withdraw.status')
      .getRawMany();

    const shopStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.shop_id', 'shop_id')
      .addSelect('shop.name', 'shop_name')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .leftJoin('withdraw.shop', 'shop')
      .groupBy('withdraw.shop_id')
      .addGroupBy('shop.name')
      .orderBy('totalAmount', 'DESC')
      .limit(5)
      .getRawMany();

    const paymentMethodStats = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.payment_method', 'payment_method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('withdraw.payment_method')
      .getRawMany();

    const totalAmount = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .select('SUM(withdraw.amount)', 'total')
      .getRawOne();

    return {
      total,
      totalAmount: parseFloat(totalAmount?.total) || 0,
      byStatus: statusStats,
      byShop: shopStats,
      byPaymentMethod: paymentMethodStats,
    };
  }

  async printStats() {
    const stats = await this.getStats();
    console.log('\n📊 Withdraw Statistics:');
    console.log(`   Total Withdraw Requests: ${stats.total}`);
    console.log(`   Total Amount Requested: $${stats.totalAmount.toFixed(2)}`);
    
    console.log('\n📈 By Status:');
    stats.byStatus.forEach((item: { status: string; count: string; totalAmount: string }) => {
      console.log(`   ${item.status}: ${item.count} requests ($${parseFloat(item.totalAmount || '0').toFixed(2)})`);
    });

    console.log('\n🏪 Top 5 Shops by Withdraw Amount:');
    stats.byShop.forEach((item: { shop_name: string; count: string; totalAmount: string }, index: number) => {
      console.log(`   ${index + 1}. ${item.shop_name}: ${item.count} requests ($${parseFloat(item.totalAmount).toFixed(2)})`);
    });

    console.log('\n💳 By Payment Method:');
    stats.byPaymentMethod.forEach((item: { payment_method: string; count: string }) => {
      console.log(`   ${item.payment_method}: ${item.count} requests`);
    });
  }
}