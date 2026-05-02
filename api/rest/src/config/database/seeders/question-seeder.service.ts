// src/config/database/seeders/question-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Question } from '../../../questions/entities/question.entity';
import { Product } from '../../../products/entities/product.entity';
import { User } from '../../../users/entities/user.entity';
import questionsJson from '../../../db/pickbazar/questions.json';
// import { Shop } from '../../../shops/entities/shop.entity';

@Injectable()
export class QuestionSeederService {
  private readonly logger = new Logger(QuestionSeederService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // Shop repository intentionally disabled for now.
    // Keep these lines for future re-enable.
    // @InjectRepository(Shop)
    // private readonly shopRepository: Repository<Shop>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Seeding questions...');
    
    try {
      await this.clear();
      
      const products = await this.productRepository.find();
      const users = await this.userRepository.find();
      // const shops = await this.shopRepository.find();
      
      const productMap = new Map<number, Product>();
      const userMap = new Map<number, User>();
      // const shopMap = new Map<number, Shop>();
      
      products.forEach(p => productMap.set(p.id, p));
      users.forEach(u => userMap.set(u.id, u));
      // shops.forEach(s => shopMap.set(s.id, s));
      
      const questionsData = plainToClass(Question, questionsJson as object[]);
      
      let savedCount = 0;
      let skippedCount = 0;
      
      for (const questionData of questionsData) {
        const product = productMap.get(questionData.product_id);
        const user = userMap.get(questionData.user_id);
        // const shop = shopMap.get(questionData.shop_id);
        
        if (!product) {
          this.logger.warn(`Skipping question ${questionData.id}: Product ${questionData.product_id} not found`);
          skippedCount++;
          continue;
        }
        
        if (!user) {
          this.logger.warn(`Skipping question ${questionData.id}: User ${questionData.user_id} not found`);
          skippedCount++;
          continue;
        }
        
        // if (!shop) {
        //   this.logger.warn(`Skipping question ${questionData.id}: Shop ${questionData.shop_id} not found`);
        //   skippedCount++;
        //   continue;
        // }
        
        const existingQuestion = await this.questionRepository.findOne({
          where: { id: questionData.id }
        });
        
        if (!existingQuestion) {
          const question = this.questionRepository.create({
            id: questionData.id,
            user_id: questionData.user_id,
            product_id: questionData.product_id,
            shop_id: questionData.shop_id,
            question: questionData.question,
            answer: questionData.answer,
            positive_feedbacks_count: questionData.positive_feedbacks_count || 0,
            negative_feedbacks_count: questionData.negative_feedbacks_count || 0,
            abusive_reports_count: questionData.abusive_reports_count || 0,
            deleted_at: questionData.deleted_at ? new Date(questionData.deleted_at) : undefined,
            created_at: questionData.created_at ? new Date(questionData.created_at) : new Date(),
            updated_at: questionData.updated_at ? new Date(questionData.updated_at) : new Date(),
            product,
            user,
            // shop,
          });
          
          await this.questionRepository.save(question);
          savedCount++;
        }
      }
      
      this.logger.log(`✅ Seeded ${savedCount} questions (${skippedCount} skipped due to missing relations)`);
      
      await this.seedAdditionalQuestions(productMap, userMap);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Failed to seed questions: ${errorMessage}`);
      throw error;
    }
  }
  
  private async seedAdditionalQuestions(
    productMap: Map<number, Product>,
    userMap: Map<number, User>
  ): Promise<void> {
    this.logger.log('📝 Seeding additional questions for products without questions...');
    
    const existingQuestions = await this.questionRepository.find({
      select: ['product_id']
    });
    
    const productsWithQuestions = new Set(existingQuestions.map(q => q.product_id));
    const productsWithoutQuestions = Array.from(productMap.values())
      .filter(p => !productsWithQuestions.has(p.id))
      .slice(0, 20);
    
    let addedCount = 0;
    const defaultUsers = Array.from(userMap.values()).slice(0, 3);
    const defaultUser = defaultUsers[0] || Array.from(userMap.values())[0];
    
    if (!defaultUser) {
      this.logger.warn('No users found, skipping additional questions');
      return;
    }
    
    const sampleQuestions = [
      { question: 'Is this product authentic?', answer: 'Yes, 100% authentic product.' },
      { question: 'How long does shipping take?', answer: 'Usually 3-5 business days.' },
      { question: 'Does it come with warranty?', answer: 'Yes, 1 year manufacturer warranty.' },
      { question: 'What are the dimensions?', answer: 'Please check the product description for details.' },
      { question: 'Is it available in other colors?', answer: 'Currently available in the colors shown.' },
      { question: 'Can this be returned if not satisfied?', answer: 'Yes, 30-day return policy.' },
      { question: 'Is this suitable for beginners?', answer: 'Yes, perfect for beginners.' },
      { question: 'What material is it made of?', answer: 'High quality materials as described.' },
    ];
    
    for (const product of productsWithoutQuestions) {
      const shopId = this.getShopIdFromProduct(product);
      if (!shopId) {
        this.logger.warn(`Skipping additional question for product ${product.id}: shop_id not available`);
        continue;
      }

      const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
      
      const question = this.questionRepository.create({
        user_id: defaultUser.id,
        product_id: product.id,
        // Shop relation object is disabled for now, but scalar shop_id is required by DB schema.
        shop_id: shopId,
        question: randomQuestion.question,
        answer: randomQuestion.answer,
        positive_feedbacks_count: 0,
        negative_feedbacks_count: 0,
        abusive_reports_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        product,
        user: defaultUser,
        // shop,
      });
      
      await this.questionRepository.save(question);
      addedCount++;
    }
    
    this.logger.log(`✅ Added ${addedCount} additional questions`);
  }
  
  async seedByProductId(productId: number): Promise<void> {
    this.logger.log(`🌱 Seeding questions for product ID: ${productId}`);
    
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      this.logger.warn(`Product with ID ${productId} not found`);
      return;
    }

    // const shop = await this.shopRepository.findOne({ where: { id: product.shop_id } });
    const users = await this.userRepository.find({ take: 2 });
    const defaultUser = users[0];

    if (!defaultUser) {
      this.logger.warn('Required relations not found');
      return;
    }

    const shopId = this.getShopIdFromProduct(product);
    if (!shopId) {
      this.logger.warn(`Product ${productId} has no shop_id, skipping question seeding`);
      return;
    }
    
    const sampleQuestionsData = [
      { question: 'Is this product fresh?', answer: 'Yes, it is fresh.' },
      { question: 'What is the shelf life?', answer: 'Please check the package for expiry date.' },
      { question: 'Is it organic?', answer: 'Yes, certified organic.' },
    ];
    
    let savedCount = 0;
    
    for (const qData of sampleQuestionsData) {
      const question = this.questionRepository.create({
        user_id: defaultUser.id,
        product_id: productId,
        shop_id: shopId,
        question: qData.question,
        answer: qData.answer,
        positive_feedbacks_count: 0,
        negative_feedbacks_count: 0,
        abusive_reports_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        product,
        user: defaultUser,
        // shop,
      });
      
      await this.questionRepository.save(question);
      savedCount++;
    }
    
    this.logger.log(`✅ Seeded ${savedCount} questions for product: ${product.name}`);
  }
  
  async seedByShopId(shopId: number): Promise<void> {
    this.logger.log(`🌱 Seeding questions for shop ID: ${shopId}`);

    // Shop lookup disabled for now.
    const products = await this.productRepository.find({ take: 10 });
    const users = await this.userRepository.find({ take: 2 });
    const defaultUser = users[0];
    
    if (!defaultUser || products.length === 0) {
      this.logger.warn('Required relations not found');
      return;
    }
    
    let savedCount = 0;
    
    for (const product of products) {
      const question = this.questionRepository.create({
        user_id: defaultUser.id,
        product_id: product.id,
        // shop_id: shopId,
        shop_id: shopId,
        question: `Does this product come with any warranty?`,
        answer: `Yes, please contact the shop for warranty details.`,
        positive_feedbacks_count: 0,
        negative_feedbacks_count: 0,
        abusive_reports_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        product,
        user: defaultUser,
        // shop,
      });
      
      await this.questionRepository.save(question);
      savedCount++;
    }
    
    this.logger.log(`✅ Seeded ${savedCount} questions for shop ID: ${shopId}`);
  }
  
  async seedByUserId(userId: number): Promise<void> {
    this.logger.log(`🌱 Seeding questions for user ID: ${userId}`);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      return;
    }
    
    const products = await this.productRepository.find({ take: 5 });
    
    let savedCount = 0;
    
    for (let i = 0; i < Math.min(products.length, 5); i++) {
      const product = products[i];
      const shopId = this.getShopIdFromProduct(product);
      if (!shopId) {
        this.logger.warn(`Skipping user question for product ${product.id}: shop_id not available`);
        continue;
      }
      
      const question = this.questionRepository.create({
        user_id: userId,
        product_id: product.id,
        shop_id: shopId,
        question: `Can you provide more details about this product?`,
        answer: `Thank you for your question. Please check the product description.`,
        positive_feedbacks_count: 0,
        negative_feedbacks_count: 0,
        abusive_reports_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        product,
        user,
        // shop,
      });
      
      await this.questionRepository.save(question);
      savedCount++;
    }
    
    this.logger.log(`✅ Seeded ${savedCount} questions for user: ${user.name}`);
  }
  
  async seedUnansweredQuestions(): Promise<void> {
    this.logger.log('❓ Seeding unanswered questions...');
    
    const products = await this.productRepository.find({ take: 15 });
    const users = await this.userRepository.find({ take: 2 });
    const defaultUser = users[0];
    
    if (!defaultUser || products.length === 0) {
      this.logger.warn('Required data not found');
      return;
    }
    
    let addedCount = 0;
    
    for (const product of products) {
      const shopId = this.getShopIdFromProduct(product);
      if (!shopId) {
        this.logger.warn(`Skipping unanswered question for product ${product.id}: shop_id not available`);
        continue;
      }

      const question = this.questionRepository.create({
        user_id: defaultUser.id,
        product_id: product.id,
        shop_id: shopId,
        question: `I would like to know more about this product before purchasing.`,
        answer: undefined,
        positive_feedbacks_count: 0,
        negative_feedbacks_count: 0,
        abusive_reports_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        product,
        user: defaultUser,
        // shop,
      });
      
      await this.questionRepository.save(question);
      addedCount++;
    }
    
    this.logger.log(`✅ Added ${addedCount} unanswered questions`);
  }
  
  async clear(): Promise<void> {
    this.logger.log('🧹 Clearing questions...');
    
    try {
      await this.questionRepository.query('SET FOREIGN_KEY_CHECKS = 0');
      await this.questionRepository.clear();
      await this.questionRepository.query('SET FOREIGN_KEY_CHECKS = 1');
      this.logger.log('✅ Questions cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to clear questions: ${errorMessage}`);
      throw error;
    }
  }
  
  async clearByProductId(productId: number): Promise<void> {
    this.logger.log(`🧹 Clearing questions for product ID: ${productId}`);
    
    const result = await this.questionRepository.delete({ product_id: productId });
    this.logger.log(`✅ Cleared ${result.affected || 0} questions for product ID ${productId}`);
  }
  
  async clearByShopId(shopId: number): Promise<void> {
    this.logger.log(`🧹 Clearing questions for shop ID: ${shopId}`);
    
    const result = await this.questionRepository.delete({ shop_id: shopId });
    this.logger.log(`✅ Cleared ${result.affected || 0} questions for shop ID ${shopId}`);
  }

  // Shop entity relation is disabled for now; we still extract scalar shop_id for DB-required inserts.
  private getShopIdFromProduct(product: Product): number | undefined {
    const rawShopId = (product as any).shop_id;
    return typeof rawShopId === 'number' && Number.isFinite(rawShopId) ? rawShopId : undefined;
  }
  
  async getStats(): Promise<{
    total: number;
    answered: number;
    unanswered: number;
    byProduct: number;
  }> {
    const total = await this.questionRepository.count();
    const answered = await this.questionRepository.count({ where: { answer: Not(IsNull()) } });
    const unanswered = total - answered;
    const byProduct = await this.questionRepository
      .createQueryBuilder('question')
      .select('COUNT(DISTINCT question.product_id)', 'count')
      .getRawOne();
    
    return {
      total,
      answered,
      unanswered,
      byProduct: byProduct?.count || 0,
    };
  }
}