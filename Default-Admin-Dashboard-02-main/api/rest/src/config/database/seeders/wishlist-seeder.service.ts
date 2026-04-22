// src/config/database/seeders/wishlist-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Wishlist } from '../../../wishlists/entities/wishlist.entity';
import { User } from '../../../users/entities/user.entity';
import { Product } from '../../../products/entities/product.entity';

@Injectable()
export class WishlistSeederService {
  private readonly logger = new Logger(WishlistSeederService.name);

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // Product data from the provided JSON with in_wishlist: true
  private readonly productData = [
    { id: 945, name: 'Forest Killer', price: 260, shop_id: 7, type_id: 8 },
    { id: 941, name: 'The Serial Killer', price: 200, shop_id: 7, type_id: 8 },
    { id: 755, name: "Melinda's Banana Chips", price: 1.59, shop_id: 6, type_id: 7 },
    { id: 569, name: 'Small asparagus 2lbs', price: 2.99, shop_id: 6, type_id: 7 },
    { id: 400, name: 'Absolute Plus Meat Dental Set', price: 10, sale_price: 7.5, shop_id: 6, type_id: 1 },
    { id: 313, name: 'Arla Lacto Free Semi Skimmed Milk', price: 5, sale_price: 4.59, shop_id: 6, type_id: 1 },
    { id: 155, name: 'Vero Moda Coco Wide Pant', price: 45, sale_price: 36, shop_id: 2, type_id: 5 },
    { id: 111, name: 'Mango Self Striped A Line Dress', min_price: 70, max_price: 81, shop_id: 2, type_id: 5 },
    { id: 110, name: 'Magnetic Designs Women Printed Fit And Flare Dress', min_price: 35, max_price: 35, shop_id: 2, type_id: 5 },
    { id: 104, name: 'Givenchy Purse', price: 75, sale_price: 60, shop_id: 3, type_id: 4 },
  ];

  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async seed() {
    try {
      this.logger.log('🌱 Seeding wishlists...');

      const users = await this.userRepository.find();
      if (users.length === 0) {
        this.logger.warn('No users found. Please seed users first.');
        return;
      }

      const productIds = this.productData.map(p => p.id);
      const products = await this.productRepository.find({
        where: productIds.map(id => ({ id })),
      });

      if (products.length === 0) {
        this.logger.warn('No products found. Please seed products first.');
        return;
      }

      // Clear existing wishlists
      await this.clear();

      const wishlists: Wishlist[] = [];
      const usedCombinations = new Set<string>();

      // Assign wishlists to users with distribution pattern
      for (const user of users) {
        // 70% of users will have wishlists
        if (Math.random() > 0.7) continue;

        // Each user gets 2-6 wishlist items
        const wishlistCount = Math.floor(Math.random() * 5) + 2;
        const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(wishlistCount, shuffledProducts.length); i++) {
          const product = shuffledProducts[i];
          const combinationKey = `${user.id}-${product.id}`;

          if (usedCombinations.has(combinationKey)) continue;

          usedCombinations.add(combinationKey);

          const wishlist = this.wishlistRepository.create({
            user_id: user.id,
            product_id: product.id,
          });

          wishlists.push(wishlist);
        }
      }

      await this.wishlistRepository.save(wishlists);
      this.logger.log(`✅ Created ${wishlists.length} wishlist items`);

      await this.printStats();

    } catch (error) {
      this.logger.error(`Failed to seed wishlists: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clear() {
    try {
      await this.wishlistRepository.clear();
      this.logger.log('🧹 Cleared all wishlists');
    } catch (error) {
      this.logger.error(`Failed to clear wishlists: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async seedByUserId(userId: number) {
    try {
      this.logger.log(`🌱 Seeding wishlists for user ${userId}...`);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.warn(`User with ID ${userId} not found.`);
        return;
      }

      const productIds = this.productData.map(p => p.id);
      const products = await this.productRepository.find({
        where: productIds.map(id => ({ id })),
      });

      if (products.length === 0) {
        this.logger.warn('No products found.');
        return;
      }

      // Clear existing wishlists for this user
      await this.wishlistRepository.delete({ user_id: userId });

      const wishlistCount = Math.floor(Math.random() * 5) + 3;
      const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
      const wishlists: Wishlist[] = [];

      for (let i = 0; i < Math.min(wishlistCount, shuffledProducts.length); i++) {
        const wishlist = this.wishlistRepository.create({
          user_id: user.id,
          product_id: shuffledProducts[i].id,
        });
        wishlists.push(wishlist);
      }

      await this.wishlistRepository.save(wishlists);
      this.logger.log(`✅ Created ${wishlists.length} wishlist items for user ${userId}`);

    } catch (error) {
      this.logger.error(`Failed to seed wishlists for user ${userId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async seedByProductId(productId: number) {
    try {
      this.logger.log(`🌱 Seeding wishlists for product ${productId}...`);

      const product = await this.productRepository.findOne({ where: { id: productId } });
      if (!product) {
        this.logger.warn(`Product with ID ${productId} not found.`);
        return;
      }

      const users = await this.userRepository.find();
      if (users.length === 0) {
        this.logger.warn('No users found.');
        return;
      }

      // Clear existing wishlists for this product
      await this.wishlistRepository.delete({ product_id: productId });

      // 40% of users will have this product in wishlist
      const wishlistCount = Math.floor(users.length * 0.4);
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const wishlists: Wishlist[] = [];

      for (let i = 0; i < Math.min(wishlistCount, shuffledUsers.length); i++) {
        const wishlist = this.wishlistRepository.create({
          user_id: shuffledUsers[i].id,
          product_id: product.id,
        });
        wishlists.push(wishlist);
      }

      await this.wishlistRepository.save(wishlists);
      this.logger.log(`✅ Created ${wishlists.length} wishlist items for product ${productId}`);

    } catch (error) {
      this.logger.error(`Failed to seed wishlists for product ${productId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async seedByShopId(shopId: number) {
    try {
      this.logger.log(`🌱 Seeding wishlists for shop ${shopId}...`);

      const products = await this.productRepository.find({ where: { shop_id: shopId } });
      if (products.length === 0) {
        this.logger.warn(`No products found for shop ${shopId}.`);
        return;
      }

      const users = await this.userRepository.find();
      if (users.length === 0) {
        this.logger.warn('No users found.');
        return;
      }

      // Clear existing wishlists for this shop's products
      await this.wishlistRepository.delete({ product_id: In(products.map(p => p.id)) });

      const wishlists: Wishlist[] = [];
      const usedCombinations = new Set<string>();

      for (const user of users) {
        if (Math.random() > 0.5) continue;

        const wishlistCount = Math.floor(Math.random() * 3) + 1;
        const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(wishlistCount, shuffledProducts.length); i++) {
          const product = shuffledProducts[i];
          const combinationKey = `${user.id}-${product.id}`;

          if (usedCombinations.has(combinationKey)) continue;

          usedCombinations.add(combinationKey);

          const wishlist = this.wishlistRepository.create({
            user_id: user.id,
            product_id: product.id,
          });

          wishlists.push(wishlist);
        }
      }

      await this.wishlistRepository.save(wishlists);
      this.logger.log(`✅ Created ${wishlists.length} wishlist items for shop ${shopId}`);

    } catch (error) {
      this.logger.error(`Failed to seed wishlists for shop ${shopId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clearByUserId(userId: number) {
    try {
      await this.wishlistRepository.delete({ user_id: userId });
      this.logger.log(`✅ Cleared wishlists for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to clear wishlists for user ${userId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clearByProductId(productId: number) {
    try {
      await this.wishlistRepository.delete({ product_id: productId });
      this.logger.log(`✅ Cleared wishlists for product ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to clear wishlists for product ${productId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async clearByShopId(shopId: number) {
    try {
      const products = await this.productRepository.find({ where: { shop_id: shopId } });
      await this.wishlistRepository.delete({ product_id: In(products.map(p => p.id)) });
      this.logger.log(`✅ Cleared wishlists for shop ${shopId}`);
    } catch (error) {
      this.logger.error(`Failed to clear wishlists for shop ${shopId}: ${this.getErrorMessage(error)}`);
      throw error;
    }
  }

  async getStats() {
    const total = await this.wishlistRepository.count();
    
    const userStats = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .select('COUNT(DISTINCT wishlist.user_id)', 'uniqueUsers')
      .addSelect('COUNT(DISTINCT wishlist.product_id)', 'uniqueProducts')
      .getRawOne();

    const topProducts = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .select('wishlist.product_id', 'product_id')
      .addSelect('product.name', 'name')
      .addSelect('COUNT(*)', 'wishlist_count')
      .leftJoin('wishlist.product', 'product')
      .groupBy('wishlist.product_id')
      .addGroupBy('product.name')
      .orderBy('wishlist_count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      total,
      uniqueUsers: parseInt(userStats?.uniqueUsers) || 0,
      uniqueProducts: parseInt(userStats?.uniqueProducts) || 0,
      avgItemsPerUser: total / (parseInt(userStats?.uniqueUsers) || 1),
      topProducts,
    };
  }

  async printStats() {
    const stats = await this.getStats();
    console.log('\n📊 Wishlist Statistics:');
    console.log(`   Total Wishlist Items: ${stats.total}`);
    console.log(`   Unique Users with Wishlists: ${stats.uniqueUsers}`);
    console.log(`   Unique Products in Wishlists: ${stats.uniqueProducts}`);
    console.log(`   Average Items per User: ${stats.avgItemsPerUser.toFixed(2)}`);

    if (stats.topProducts.length > 0) {
      console.log('\n📈 Top 5 Most Wished Products:');
      stats.topProducts.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (${item.wishlist_count} users)`);
      });
    }
  }
}
