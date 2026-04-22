// src/config/database/seeders/seeder.command.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeederModule } from './seeder.module';
import { UserSeederService } from './user-seeder.service';
import { AnalyticsSeederService } from './analytics-seeder.service';
import { AttributesSeederService } from './attributes-seeder.service';
import { AuthorsSeederService } from './authors-seeder.service';
import { BecomeSellerSeederService } from './become-seller-seeder.service';
import { CategoriesSeederService } from './categories-seeder.service';
import { ConversationsSeederService } from './conversations-seeder.service';
import { CouponsSeederService } from './coupons-seeder.service';
import { FaqsSeederService } from './faqs-seeder.service';
import { FlashSaleSeederService } from './flash-sale-seeder.service';
import { ManufacturerSeederService } from './manufacturer-seeder.service';
import { MessageSeederService } from './messages-seeder.service';
import { OrderSeederService } from './order-seeder.service';
import { OwnershipTransferSeederService } from './ownership-transfer-seeder.service';
import { PaymentSeederService } from './payment-seeder.service';
import { PaymentMethodSeederService } from './payment-method-seeder.service';
import { ProductSeederService } from './product-seeder.service';
import { QuestionSeederService } from './question-seeder.service';
import { RefundPolicySeederService } from './refund-policy-seeder.service';
import { RefundReasonSeederService } from './refund-reason-seeder.service';
import { ReportSeederService } from './report-seeder.service';
import { ReviewSeederService } from './review-seeder.service';
import { ShippingSeederService } from './shipping-seeder.service';
import { ShopSeederService } from './shop-seeder.service';
import { StoreNoticeSeederService } from './store-notice-seeder.service';
import { TagSeederService } from './tag-seeder.service';
import { TaxSeederService } from './tax-seeder.service';
import { TermsAndConditionsSeederService } from './terms-and-conditions-seeder.service';
import { TypeSeederService } from './type-seeder.service';
import { WishlistSeederService } from './wishlist-seeder.service';
import { WithdrawSeederService } from './withdraw-seeder.service';


async function bootstrap() {
  const logger = new Logger('Seeder');

  try {
    const appContext = await NestFactory.createApplicationContext(SeederModule);

    // Get argument from command line
    const args = process.argv.slice(2);
    const command = args[0];
    const subCommand = args[1];
    const specificValue = args[2];
    const thirdParam = args[3];

    const userSeeder = appContext.get(UserSeederService);
    const analyticsSeeder = appContext.get(AnalyticsSeederService);
    const attributesSeeder = appContext.get(AttributesSeederService);
    const authorsSeeder = appContext.get(AuthorsSeederService);
    const becomeSellerSeeder = appContext.get(BecomeSellerSeederService);
    const categoriesSeeder = appContext.get(CategoriesSeederService);
    const conversationsSeeder = appContext.get(ConversationsSeederService);
    const couponsSeeder = appContext.get(CouponsSeederService);
    const faqsSeeder = appContext.get(FaqsSeederService);
    const flashSaleSeeder = appContext.get(FlashSaleSeederService);
    const manufacturerSeeder = appContext.get(ManufacturerSeederService);
    const messageSeeder = appContext.get(MessageSeederService);
    const orderSeeder = appContext.get(OrderSeederService);
    const ownershipTransferSeeder = appContext.get(OwnershipTransferSeederService);
    const paymentSeeder = appContext.get(PaymentSeederService);
    const paymentMethodSeeder = appContext.get(PaymentMethodSeederService);
    const productSeeder = appContext.get(ProductSeederService);
    const questionSeeder = appContext.get(QuestionSeederService);
    const refundPolicySeeder = appContext.get(RefundPolicySeederService);
    const refundReasonSeeder = appContext.get(RefundReasonSeederService);
    const reportSeeder = appContext.get(ReportSeederService);
    const reviewSeeder = appContext.get(ReviewSeederService);
    const shippingSeeder = appContext.get(ShippingSeederService);
    const shopSeeder = appContext.get(ShopSeederService);
    const storeNoticeSeeder = appContext.get(StoreNoticeSeederService);
    const tagSeeder = appContext.get(TagSeederService);
    const taxSeeder = appContext.get(TaxSeederService);
    const termsAndConditionsSeeder = appContext.get(TermsAndConditionsSeederService);
    const typeSeeder = appContext.get(TypeSeederService);
    const wishlistSeeder = appContext.get(WishlistSeederService);
    const withdrawSeeder = appContext.get(WithdrawSeederService);

    console.log('\n' + '='.repeat(60));
    console.log('🌱 MARVEL DATABASE SEEDER');
    console.log('='.repeat(60));

    if (command === '--clear') {
      logger.log('🧹 Running seeder clear command...');

      if (subCommand === '--users') {
        await userSeeder.clear();
        logger.log('✅ Users cleared successfully');
      } else if (subCommand === '--analytics') {
        await analyticsSeeder.clear();
        logger.log('✅ Analytics cleared successfully');
      } else if (subCommand === '--attributes') {
        await attributesSeeder.clear();
        logger.log('✅ Attributes cleared successfully');
      } else if (subCommand === '--authors') {
        await authorsSeeder.clear();
        logger.log('✅ Authors cleared successfully');
      } else if (subCommand === '--become-seller') {
        await becomeSellerSeeder.clear();
        logger.log('✅ Become seller cleared successfully');
      } else if (subCommand === '--categories') {
        await categoriesSeeder.clear();
        logger.log('✅ Categories cleared successfully');
      } else if (subCommand === '--conversations') {
        await conversationsSeeder.clear();
        logger.log('✅ Conversations cleared successfully');
      } else if (subCommand === '--coupons') {
        await couponsSeeder.clear();
        logger.log('✅ Coupons cleared successfully');
      } else if (subCommand === '--faqs') {
        await faqsSeeder.clear();
        logger.log('✅ FAQs cleared successfully');
      } else if (subCommand === '--flash-sale') {
        await flashSaleSeeder.clear();
        logger.log('✅ Flash sale cleared successfully');
      } else if (subCommand === '--manufacturers') {
        await manufacturerSeeder.clear();
        logger.log('✅ Manufacturers cleared successfully');
      } else if (subCommand === '--messages') {
        await messageSeeder.clear();
        logger.log('✅ Messages cleared successfully');
      } else if (subCommand === '--orders') {
        await orderSeeder.clear();
        logger.log('✅ Orders cleared successfully');
      } else if (subCommand === '--ownership-transfer') {
        await ownershipTransferSeeder.clear();
        logger.log('✅ Ownership transfers cleared successfully');
      } else if (subCommand === '--payment') {
        await paymentSeeder.clear();
        logger.log('✅ Payment data cleared successfully');
      } else if (subCommand === '--payment-methods') {
        await paymentMethodSeeder.clear();
        logger.log('✅ Payment methods cleared successfully');
      } else if (subCommand === '--products') {
        await productSeeder.clear();
        logger.log('✅ Products cleared successfully');
      } else if (subCommand === '--questions') {
        await questionSeeder.clear();
        logger.log('✅ Questions cleared successfully');
      } else if (subCommand === '--refund-policies') {
        await refundPolicySeeder.clear();
        logger.log('✅ Refund policies cleared successfully');
      } else if (subCommand === '--refund-reasons') {
        await refundReasonSeeder.clear();
        logger.log('✅ Refund reasons cleared successfully');
      } else if (subCommand === '--reports') {
        await reportSeeder.clear();
        logger.log('✅ Reports cleared successfully');
      } else if (subCommand === '--reviews') {
        await reviewSeeder.clear();
        logger.log('✅ Reviews cleared successfully');
      } else if (subCommand === '--shippings') {
        await shippingSeeder.clear();
        logger.log('✅ Shippings cleared successfully');
      } else if (subCommand === '--shops') {
        await shopSeeder.clear();
        logger.log('✅ Shops cleared successfully');
      } else if (subCommand === '--store-notices') {
        await storeNoticeSeeder.clear();
        logger.log('✅ Store notices cleared successfully');
      } else if (subCommand === '--tags') {
        await tagSeeder.clear();
        logger.log('✅ Tags cleared successfully');
      } else if (subCommand === '--taxes') {
        await taxSeeder.clear();
        logger.log('✅ Taxes cleared successfully');
      } else if (subCommand === '--terms-and-conditions') {
        await termsAndConditionsSeeder.clear();
        logger.log('✅ Terms and conditions cleared successfully');
      } else if (subCommand === '--types') {
        await typeSeeder.clear();
        logger.log('✅ Types cleared successfully');
      } else if (subCommand === '--wishlists') {
        await wishlistSeeder.clear();
        logger.log('✅ Wishlists cleared successfully');
      } else if (subCommand === '--withdraws') {
        await withdrawSeeder.clear();
        logger.log('✅ Withdraws cleared successfully');
      } else if (subCommand === '--questions-product' && specificValue) {
        await questionSeeder.clearByProductId(parseInt(specificValue, 10));
        logger.log(`✅ Questions for product ${specificValue} cleared successfully`);
      } else if (subCommand === '--questions-shop' && specificValue) {
        await questionSeeder.clearByShopId(parseInt(specificValue, 10));
        logger.log(`✅ Questions for shop ${specificValue} cleared successfully`);
      } else if (subCommand === '--wishlists-user' && specificValue) {
        await wishlistSeeder.clearByUserId(parseInt(specificValue, 10));
        logger.log(`✅ Wishlists for user ${specificValue} cleared successfully`);
      } else if (subCommand === '--wishlists-product' && specificValue) {
        await wishlistSeeder.clearByProductId(parseInt(specificValue, 10));
        logger.log(`✅ Wishlists for product ${specificValue} cleared successfully`);
      } else if (subCommand === '--wishlists-shop' && specificValue) {
        await wishlistSeeder.clearByShopId(parseInt(specificValue, 10));
        logger.log(`✅ Wishlists for shop ${specificValue} cleared successfully`);
      } else if (subCommand === '--withdraws-shop' && specificValue) {
        await withdrawSeeder.clearByShopId(parseInt(specificValue, 10));
        logger.log(`✅ Withdraws for shop ${specificValue} cleared successfully`);
      } else if (subCommand === '--withdraws-status' && specificValue) {
        await withdrawSeeder.clearByStatus(specificValue);
        logger.log(`✅ Withdraws with status ${specificValue} cleared successfully`);
      } else {
        // Clear all
        await userSeeder.clear();
        await analyticsSeeder.clear();
        await attributesSeeder.clear();
        await authorsSeeder.clear();
        await becomeSellerSeeder.clear();
        await categoriesSeeder.clear();
        await conversationsSeeder.clear();
        await couponsSeeder.clear();
        await faqsSeeder.clear();
        await flashSaleSeeder.clear();
        await manufacturerSeeder.clear();
        await messageSeeder.clear();
        await orderSeeder.clear();
        await ownershipTransferSeeder.clear();
        await paymentSeeder.clear();
        await paymentMethodSeeder.clear();
        await productSeeder.clear();
        await questionSeeder.clear();
        await refundPolicySeeder.clear();
        await refundReasonSeeder.clear();
        await reportSeeder.clear();
        await reviewSeeder.clear();
        await shippingSeeder.clear();
        await shopSeeder.clear();
        await storeNoticeSeeder.clear();
        await tagSeeder.clear();
        await taxSeeder.clear();
        await termsAndConditionsSeeder.clear();
        await typeSeeder.clear();
        await wishlistSeeder.clear();
        await withdrawSeeder.clear();
        logger.log('✅ All data cleared successfully');
      }
    } else if (command === '--users') {
      logger.log('👤 Running users seeder only...');
      await userSeeder.seed();
    } else if (command === '--analytics') {
      logger.log('📊 Running analytics seeder only...');
      await analyticsSeeder.seed();
    } else if (command === '--attributes') {
      logger.log('🏷️ Running attributes seeder only...');
      await attributesSeeder.seed();
    } else if (command === '--authors') {
      logger.log('✍️ Running authors seeder only...');
      await authorsSeeder.seed();
    } else if (command === '--become-seller') {
      logger.log('🛍️ Running become seller seeder only...');
      await becomeSellerSeeder.seed();
    } else if (command === '--categories') {
      logger.log('📁 Running categories seeder only...');
      await categoriesSeeder.seed();
    } else if (command === '--conversations') {
      logger.log('💬 Running conversations seeder only...');
      await conversationsSeeder.seed();
    } else if (command === '--coupons') {
      logger.log('🎫 Running coupons seeder only...');
      await couponsSeeder.seed();
    } else if (command === '--faqs') {
      logger.log('❓ Running FAQs seeder only...');
      await faqsSeeder.seed();
    } else if (command === '--flash-sale') {
      logger.log('⚡ Running flash sale seeder only...');
      await flashSaleSeeder.seed();
    } else if (command === '--manufacturers') {
      logger.log('🏭 Running manufacturers seeder only...');
      await manufacturerSeeder.seed();
    } else if (command === '--messages') {
      logger.log('💬 Running messages seeder only...');
      await messageSeeder.seed();
    } else if (command === '--orders') {
      logger.log('📦 Running orders seeder only...');
      await orderSeeder.seed();
    } else if (command === '--ownership-transfer') {
      logger.log('🔄 Running ownership transfer seeder only...');
      await ownershipTransferSeeder.seed();
    } else if (command === '--payment') {
      logger.log('💳 Running payment seeder only...');
      await paymentSeeder.seed();
    } else if (command === '--payment-methods') {
      logger.log('💳 Running payment methods seeder only...');
      await paymentMethodSeeder.seed();
    } else if (command === '--products') {
      logger.log('📦 Running products seeder only...');
      
      if (subCommand === '--type' && specificValue) {
        await productSeeder.seedSpecific(specificValue);
      } else if (subCommand === '--shop' && specificValue) {
        await productSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === '--category' && specificValue) {
        await productSeeder.seedByCategoryId(parseInt(specificValue, 10));
      } else {
        await productSeeder.seed();
      }
    } else if (command === '--questions') {
      logger.log('❓ Running questions seeder only...');
      
      if (subCommand === '--product' && specificValue) {
        await questionSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === '--shop' && specificValue) {
        await questionSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === '--user' && specificValue) {
        await questionSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === '--unanswered') {
        await questionSeeder.seedUnansweredQuestions();
      } else if (subCommand === '--stats') {
        const stats = await questionSeeder.getStats();
        console.log('\n📊 Question Statistics:');
        console.log(`   Total Questions: ${stats.total}`);
        console.log(`   Answered: ${stats.answered}`);
        console.log(`   Unanswered: ${stats.unanswered}`);
        console.log(`   Products with Questions: ${stats.byProduct}`);
      } else {
        await questionSeeder.seed();
      }
    } else if (command === '--wishlists') {
      logger.log('❤️ Running wishlists seeder only...');
      
      if (subCommand === '--user' && specificValue) {
        await wishlistSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === '--product' && specificValue) {
        await wishlistSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === '--shop' && specificValue) {
        await wishlistSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === '--stats') {
        await wishlistSeeder.printStats();
      } else {
        await wishlistSeeder.seed();
      }
    } else if (command === '--withdraws') {
      logger.log('💰 Running withdraws seeder only...');
      
      if (subCommand === '--shop' && specificValue) {
        await withdrawSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === '--status' && specificValue) {
        await withdrawSeeder.seedByStatus(specificValue);
      } else if (subCommand === '--stats') {
        await withdrawSeeder.printStats();
      } else {
        await withdrawSeeder.seed();
      }
    } else if (command === '--refund-policies') {
      logger.log('📋 Running refund policies seeder only...');
      
      if (subCommand === '--target' && specificValue) {
        await refundPolicySeeder.seedByTarget(specificValue);
      } else if (subCommand === '--status' && specificValue) {
        await refundPolicySeeder.seedByStatus(specificValue);
      } else if (subCommand === '--language' && specificValue) {
        await refundPolicySeeder.seedByLanguage(specificValue);
      } else if (subCommand === '--stats') {
        const stats = await refundPolicySeeder.getStats();
        console.log('\n📊 Refund Policy Statistics:');
        console.log(`   Total Policies: ${stats.total}`);
        console.log(`   By Target - Vendor: ${stats.byTarget.vendor}`);
        console.log(`   By Target - Customer: ${stats.byTarget.customer}`);
        console.log(`   By Status - Approved: ${stats.byStatus.approved}`);
        console.log(`   By Status - Pending: ${stats.byStatus.pending}`);
        console.log(`   Languages: ${stats.languages.join(', ')}`);
      } else {
        await refundPolicySeeder.seed();
      }
    } else if (command === '--refund-reasons') {
      logger.log('📋 Running refund reasons seeder only...');
      
      if (subCommand === '--language' && specificValue) {
        await refundReasonSeeder.seedByLanguage(specificValue);
      } else if (subCommand === '--stats') {
        const stats = await refundReasonSeeder.getStats();
        console.log('\n📊 Refund Reason Statistics:');
        console.log(`   Total Reasons: ${stats.total}`);
        console.log(`   Languages: ${stats.languages.join(', ')}`);
        console.log('   Reasons List:');
        stats.reasons.forEach((reason: { name: string; slug: string }) => {
          console.log(`     - ${reason.name} (${reason.slug})`);
        });
      } else {
        await refundReasonSeeder.seed();
      }
    } else if (command === '--reports') {
      logger.log('📋 Running reports seeder only...');
      
      if (subCommand === '--model-type' && specificValue) {
        await reportSeeder.seedByModelType(specificValue);
      } else if (subCommand === '--user' && specificValue) {
        await reportSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === '--stats') {
        const stats = await reportSeeder.getStats();
        console.log('\n📊 Report Statistics:');
        console.log(`   Total Reports: ${stats.total}`);
        console.log(`   By Model Type:`);
        Object.entries(stats.byModelType).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });
        console.log(`   Unique Users Reporting: ${stats.uniqueUsers}`);
      } else {
        await reportSeeder.seed();
      }
    } else if (command === '--reviews') {
      logger.log('⭐ Running reviews seeder only...');
      
      if (subCommand === '--product' && specificValue) {
        await reviewSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === '--user' && specificValue) {
        await reviewSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === '--rating' && specificValue) {
        await reviewSeeder.seedByRating(parseInt(specificValue, 10));
      } else if (subCommand === '--stats') {
        const stats = await reviewSeeder.getStats();
        console.log('\n📊 Review Statistics:');
        console.log(`   Total Reviews: ${stats.total}`);
        console.log(`   Average Rating: ${stats.averageRating.toFixed(2)}`);
        console.log(`   By Rating:`);
        Object.entries(stats.byRating).forEach(([rating, count]) => {
          console.log(`     - ${rating} star(s): ${count}`);
        });
        console.log(`   Unique Products Reviewed: ${stats.uniqueProducts}`);
        console.log(`   Unique Users: ${stats.uniqueUsers}`);
      } else {
        await reviewSeeder.seed();
      }
    } else if (command === '--shippings') {
      logger.log('🚚 Running shippings seeder only...');
      
      if (subCommand === '--type' && specificValue) {
        await shippingSeeder.seedByType(specificValue);
      } else if (subCommand === '--global') {
        await shippingSeeder.seedByGlobalStatus(true);
      } else if (subCommand === '--non-global') {
        await shippingSeeder.seedByGlobalStatus(false);
      } else if (subCommand === '--stats') {
        const stats = await shippingSeeder.getStats();
        console.log('\n📊 Shipping Statistics:');
        console.log(`   Total Shipping Methods: ${stats.total}`);
        console.log(`   By Type:`);
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });
        console.log(`   Global Methods: ${stats.globalCount}`);
        console.log(`   Non-Global Methods: ${stats.nonGlobalCount}`);
        console.log(`   Average Amount: ${stats.averageAmount}`);
      } else {
        await shippingSeeder.seed();
      }
    } else if (command === '--shops') {
      logger.log('🏪 Running shops seeder only...');
      
      if (subCommand === '--owner' && specificValue) {
        await shopSeeder.seedByOwnerId(parseInt(specificValue, 10));
      } else if (subCommand === '--active') {
        await shopSeeder.seedByActiveStatus(true);
      } else if (subCommand === '--inactive') {
        await shopSeeder.seedByActiveStatus(false);
      } else if (subCommand === '--stats') {
        const stats = await shopSeeder.getStats();
        console.log('\n📊 Shop Statistics:');
        console.log(`   Total Shops: ${stats.total}`);
        console.log(`   Active Shops: ${stats.activeCount}`);
        console.log(`   Inactive Shops: ${stats.inactiveCount}`);
        console.log(`   Total Products Across Shops: ${stats.totalProducts}`);
        console.log(`   Total Orders Across Shops: ${stats.totalOrders}`);
        console.log(`   Average Products per Shop: ${stats.avgProductsPerShop}`);
      } else {
        await shopSeeder.seed();
      }
    } else if (command === '--store-notices') {
      logger.log('📢 Running store notices seeder only...');
      
      if (subCommand === '--priority' && specificValue) {
        await storeNoticeSeeder.seedByPriority(specificValue);
      } else if (subCommand === '--type' && specificValue) {
        await storeNoticeSeeder.seedByType(specificValue);
      } else if (subCommand === '--creator' && specificValue) {
        await storeNoticeSeeder.seedByCreator(parseInt(specificValue, 10));
      } else if (subCommand === '--stats') {
        const stats = await storeNoticeSeeder.getStats();
        console.log('\n📊 Store Notice Statistics:');
        console.log(`   Total Notices: ${stats.total}`);
        console.log(`   By Priority:`);
        Object.entries(stats.byPriority).forEach(([priority, count]) => {
          console.log(`     - ${priority}: ${count}`);
        });
        console.log(`   By Type:`);
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });
        console.log(`   Unique Users Notified: ${stats.uniqueUsers}`);
      } else {
        await storeNoticeSeeder.seed();
      }
    } else if (command === '--tags') {
      logger.log('🏷️ Running tags seeder only...');
      
      if (subCommand === '--language' && specificValue) {
        await tagSeeder.seedByLanguage(specificValue);
      } else if (subCommand === '--type' && specificValue) {
        await tagSeeder.seedByType(parseInt(specificValue, 10));
      } else if (subCommand === '--stats') {
        const stats = await tagSeeder.getStats();
        console.log('\n📊 Tag Statistics:');
        console.log(`   Total Tags: ${stats.total}`);
        console.log(`   Languages: ${stats.languages.join(', ')}`);
        console.log(`   Tags by Type:`);
        Object.entries(stats.byType).forEach(([typeId, count]) => {
          console.log(`     - Type ID ${typeId}: ${count}`);
        });
        console.log('   Tags List:');
        stats.tags.forEach((tag: { name: string; slug: string; language: string }) => {
          console.log(`     - ${tag.name} (${tag.slug}) [${tag.language}]`);
        });
      } else {
        await tagSeeder.seed();
      }
    } else if (command === '--taxes') {
      logger.log('💰 Running taxes seeder only...');
      
      if (subCommand === '--country' && specificValue) {
        await taxSeeder.seedByCountry(specificValue);
      } else if (subCommand === '--state' && specificValue) {
        await taxSeeder.seedByState(specificValue);
      } else if (subCommand === '--global') {
        await taxSeeder.seedByGlobalStatus(true);
      } else if (subCommand === '--non-global') {
        await taxSeeder.seedByGlobalStatus(false);
      } else if (subCommand === '--stats') {
        const stats = await taxSeeder.getStats();
        console.log('\n📊 Tax Statistics:');
        console.log(`   Total Tax Rules: ${stats.total}`);
        console.log(`   Global Tax Rules: ${stats.globalCount}`);
        console.log(`   Location-Based Rules: ${stats.locationBasedCount}`);
        console.log(`   Average Tax Rate: ${stats.averageRate}%`);
        console.log(`   Tax on Shipping Enabled: ${stats.taxOnShippingCount}`);
        console.log(`   By Country:`);
        Object.entries(stats.byCountry).forEach(([country, count]) => {
          console.log(`     - ${country || 'Global'}: ${count}`);
        });
      } else {
        await taxSeeder.seed();
      }
    } else if (command === '--terms-and-conditions') {
      logger.log('📋 Running terms and conditions seeder only...');
      
      if (subCommand === '--type' && specificValue) {
        await termsAndConditionsSeeder.seedByType(specificValue);
      } else if (subCommand === '--language' && specificValue) {
        await termsAndConditionsSeeder.seedByLanguage(specificValue);
      } else if (subCommand === '--approved') {
        await termsAndConditionsSeeder.seedByApprovalStatus(true);
      } else if (subCommand === '--pending') {
        await termsAndConditionsSeeder.seedByApprovalStatus(false);
      } else if (subCommand === '--stats') {
        const stats = await termsAndConditionsSeeder.getStats();
        console.log('\n📊 Terms and Conditions Statistics:');
        console.log(`   Total Terms: ${stats.total}`);
        console.log(`   Approved Terms: ${stats.approvedCount}`);
        console.log(`   Pending Terms: ${stats.pendingCount}`);
        console.log(`   Languages: ${stats.languages.join(', ')}`);
        console.log(`   Terms by Type:`);
        Object.entries(stats.byType).forEach(([type, count]) => {
          console.log(`     - ${type}: ${count}`);
        });
        console.log('   Terms List:');
        stats.terms.forEach((term: { title: string; slug: string; type: string; is_approved: boolean }) => {
          console.log(`     - ${term.title} (${term.slug}) [${term.type}] - ${term.is_approved ? 'Approved' : 'Pending'}`);
        });
      } else {
        await termsAndConditionsSeeder.seed();
      }
    } else if (command === '--types') {
      logger.log('🏷️ Running types seeder only...');
      
      if (subCommand === '--language' && specificValue) {
        await typeSeeder.seedByLanguage(specificValue);
      } else if (subCommand === '--stats') {
        const stats = await typeSeeder.getStats();
        console.log('\n📊 Type Statistics:');
        console.log(`   Total Types: ${stats.total}`);
        console.log(`   Languages: ${stats.languages.join(', ')}`);
        console.log('   Types List:');
        stats.types.forEach((type: { name: string; slug: string; language: string }) => {
          console.log(`     - ${type.name} (${type.slug}) [${type.language}]`);
        });
      } else {
        await typeSeeder.seed();
      }
    } else if (command === '--seed-specific') {
      if (subCommand === 'analytics') {
        logger.log('📊 Seeding analytics data only...');
        await analyticsSeeder.seed();
      } else if (subCommand === 'category') {
        logger.log('📊 Seeding category wise products...');
        await analyticsSeeder.seedSpecific('category');
      } else if (subCommand === 'low-stock') {
        logger.log('📊 Seeding low stock products...');
        await analyticsSeeder.seedSpecific('low-stock');
      } else if (subCommand === 'top-rate') {
        logger.log('📊 Seeding top rate products...');
        await analyticsSeeder.seedSpecific('top-rate');
      } else if (subCommand === 'manufacturers') {
        logger.log('🏭 Seeding manufacturers...');
        await manufacturerSeeder.seed();
      } else if (subCommand === 'manufacturers-books') {
        logger.log('📚 Seeding book manufacturers...');
        await manufacturerSeeder.seedSpecific('books');
      } else if (subCommand === 'manufacturers-gadgets') {
        logger.log('💻 Seeding gadget manufacturers...');
        await manufacturerSeeder.seedSpecific('gadgets');
      } else if (subCommand === 'manufacturers-medicine') {
        logger.log('💊 Seeding medicine manufacturers...');
        await manufacturerSeeder.seedSpecific('medicine');
      } else if (subCommand === 'messages') {
        logger.log('💬 Seeding messages...');
        await messageSeeder.seed();
      } else if (subCommand === 'messages-conversation' && specificValue) {
        logger.log(`💬 Seeding messages for conversation ${specificValue}...`);
        await messageSeeder.seedSpecific(parseInt(specificValue, 10));
      } else if (subCommand === 'orders') {
        logger.log('📦 Seeding orders...');
        await orderSeeder.seed();
      } else if (subCommand === 'orders-statuses') {
        logger.log('📋 Seeding order statuses...');
        await orderSeeder.seedSpecific('statuses');
      } else if (subCommand === 'orders-files') {
        logger.log('📎 Seeding order files...');
        await orderSeeder.seedSpecific('files');
      } else if (subCommand === 'orders-customer' && specificValue) {
        logger.log(`👤 Seeding orders for customer ${specificValue}...`);
        await orderSeeder.seedByCustomerId(parseInt(specificValue, 10));
      } else if (subCommand === 'orders-status' && specificValue) {
        logger.log(`📋 Seeding orders with status ${specificValue}...`);
        await orderSeeder.seedByOrderStatus(specificValue);
      } else if (subCommand === 'ownership-transfer') {
        logger.log('🔄 Seeding ownership transfers...');
        await ownershipTransferSeeder.seed();
      } else if (subCommand === 'ownership-transfer-status' && specificValue) {
        logger.log(`🔄 Seeding ownership transfers with status ${specificValue}...`);
        await ownershipTransferSeeder.seedByStatus(specificValue);
      } else if (subCommand === 'ownership-transfer-previous' && specificValue) {
        logger.log(`🔄 Seeding ownership transfers for previous owner ${specificValue}...`);
        await ownershipTransferSeeder.seedByPreviousOwner(parseInt(specificValue, 10));
      } else if (subCommand === 'ownership-transfer-current' && specificValue) {
        logger.log(`🔄 Seeding ownership transfers for current owner ${specificValue}...`);
        await ownershipTransferSeeder.seedByCurrentOwner(parseInt(specificValue, 10));
      } else if (subCommand === 'payment') {
        logger.log('💳 Seeding payment data...');
        await paymentSeeder.seed();
      } else if (subCommand === 'payment-stripe') {
        logger.log('💳 Seeding Stripe payments...');
        await paymentSeeder.seedSpecific('stripe-payments');
      } else if (subCommand === 'payment-paypal') {
        logger.log('💳 Seeding PayPal payments...');
        await paymentSeeder.seedSpecific('paypal-payments');
      } else if (subCommand === 'payment-refunds') {
        logger.log('💰 Seeding refunds...');
        await paymentSeeder.seedSpecific('refunds');
      } else if (subCommand === 'payment-methods-gateways') {
        logger.log('🏦 Seeding payment gateways...');
        await paymentMethodSeeder.seedSpecific('gateways');
      } else if (subCommand === 'payment-methods-cards') {
        logger.log('💳 Seeding payment methods...');
        await paymentMethodSeeder.seedSpecific('methods');
      } else if (subCommand === 'products') {
        logger.log('📦 Seeding products...');
        await productSeeder.seed();
      } else if (subCommand === 'products-type' && specificValue) {
        logger.log(`📦 Seeding products for type: ${specificValue}...`);
        await productSeeder.seedSpecific(specificValue);
      } else if (subCommand === 'products-shop' && specificValue) {
        logger.log(`🏪 Seeding products for shop ID: ${specificValue}...`);
        await productSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === 'products-category' && specificValue) {
        logger.log(`📁 Seeding products for category ID: ${specificValue}...`);
        await productSeeder.seedByCategoryId(parseInt(specificValue, 10));
      } else if (subCommand === 'questions') {
        logger.log('❓ Seeding questions...');
        await questionSeeder.seed();
      } else if (subCommand === 'questions-product' && specificValue) {
        logger.log(`❓ Seeding questions for product ID: ${specificValue}...`);
        await questionSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === 'questions-shop' && specificValue) {
        logger.log(`🏪 Seeding questions for shop ID: ${specificValue}...`);
        await questionSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === 'questions-user' && specificValue) {
        logger.log(`👤 Seeding questions for user ID: ${specificValue}...`);
        await questionSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === 'questions-unanswered') {
        logger.log('❓ Seeding unanswered questions...');
        await questionSeeder.seedUnansweredQuestions();
      } else if (subCommand === 'wishlists') {
        logger.log('❤️ Seeding wishlists...');
        await wishlistSeeder.seed();
      } else if (subCommand === 'wishlists-user' && specificValue) {
        logger.log(`❤️ Seeding wishlists for user ${specificValue}...`);
        await wishlistSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === 'wishlists-product' && specificValue) {
        logger.log(`❤️ Seeding wishlists for product ${specificValue}...`);
        await wishlistSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === 'wishlists-shop' && specificValue) {
        logger.log(`❤️ Seeding wishlists for shop ${specificValue}...`);
        await wishlistSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === 'withdraws') {
        logger.log('💰 Seeding withdraws...');
        await withdrawSeeder.seed();
      } else if (subCommand === 'withdraws-shop' && specificValue) {
        logger.log(`💰 Seeding withdraws for shop ${specificValue}...`);
        await withdrawSeeder.seedByShopId(parseInt(specificValue, 10));
      } else if (subCommand === 'withdraws-status' && specificValue) {
        logger.log(`💰 Seeding withdraws with status ${specificValue}...`);
        await withdrawSeeder.seedByStatus(specificValue);
      } else if (subCommand === 'refund-policies') {
        logger.log('📋 Seeding refund policies...');
        await refundPolicySeeder.seed();
      } else if (subCommand === 'refund-policies-target' && specificValue) {
        logger.log(`📋 Seeding refund policies for target: ${specificValue}...`);
        await refundPolicySeeder.seedByTarget(specificValue);
      } else if (subCommand === 'refund-policies-status' && specificValue) {
        logger.log(`📋 Seeding refund policies with status: ${specificValue}...`);
        await refundPolicySeeder.seedByStatus(specificValue);
      } else if (subCommand === 'refund-policies-language' && specificValue) {
        logger.log(`📋 Seeding refund policies for language: ${specificValue}...`);
        await refundPolicySeeder.seedByLanguage(specificValue);
      } else if (subCommand === 'refund-reasons') {
        logger.log('📋 Seeding refund reasons...');
        await refundReasonSeeder.seed();
      } else if (subCommand === 'refund-reasons-language' && specificValue) {
        logger.log(`📋 Seeding refund reasons for language: ${specificValue}...`);
        await refundReasonSeeder.seedByLanguage(specificValue);
      } else if (subCommand === 'reports') {
        logger.log('📋 Seeding reports...');
        await reportSeeder.seed();
      } else if (subCommand === 'reports-model-type' && specificValue) {
        logger.log(`📋 Seeding reports for model type: ${specificValue}...`);
        await reportSeeder.seedByModelType(specificValue);
      } else if (subCommand === 'reports-user' && specificValue) {
        logger.log(`📋 Seeding reports for user ID: ${specificValue}...`);
        await reportSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === 'reviews') {
        logger.log('⭐ Seeding reviews...');
        await reviewSeeder.seed();
      } else if (subCommand === 'reviews-product' && specificValue) {
        logger.log(`⭐ Seeding reviews for product ID: ${specificValue}...`);
        await reviewSeeder.seedByProductId(parseInt(specificValue, 10));
      } else if (subCommand === 'reviews-user' && specificValue) {
        logger.log(`⭐ Seeding reviews for user ID: ${specificValue}...`);
        await reviewSeeder.seedByUserId(parseInt(specificValue, 10));
      } else if (subCommand === 'reviews-rating' && specificValue) {
        logger.log(`⭐ Seeding reviews with rating: ${specificValue}...`);
        await reviewSeeder.seedByRating(parseInt(specificValue, 10));
      } else if (subCommand === 'shippings') {
        logger.log('🚚 Seeding shippings...');
        await shippingSeeder.seed();
      } else if (subCommand === 'shippings-type' && specificValue) {
        logger.log(`🚚 Seeding shippings with type: ${specificValue}...`);
        await shippingSeeder.seedByType(specificValue);
      } else if (subCommand === 'shippings-global') {
        logger.log('🚚 Seeding global shippings...');
        await shippingSeeder.seedByGlobalStatus(true);
      } else if (subCommand === 'shops') {
        logger.log('🏪 Seeding shops...');
        await shopSeeder.seed();
      } else if (subCommand === 'shops-owner' && specificValue) {
        logger.log(`🏪 Seeding shops for owner ID: ${specificValue}...`);
        await shopSeeder.seedByOwnerId(parseInt(specificValue, 10));
      } else if (subCommand === 'shops-active') {
        logger.log('🏪 Seeding active shops...');
        await shopSeeder.seedByActiveStatus(true);
      } else if (subCommand === 'store-notices') {
        logger.log('📢 Seeding store notices...');
        await storeNoticeSeeder.seed();
      } else if (subCommand === 'store-notices-priority' && specificValue) {
        logger.log(`📢 Seeding store notices with priority: ${specificValue}...`);
        await storeNoticeSeeder.seedByPriority(specificValue);
      } else if (subCommand === 'store-notices-type' && specificValue) {
        logger.log(`📢 Seeding store notices with type: ${specificValue}...`);
        await storeNoticeSeeder.seedByType(specificValue);
      } else if (subCommand === 'store-notices-creator' && specificValue) {
        logger.log(`📢 Seeding store notices created by user: ${specificValue}...`);
        await storeNoticeSeeder.seedByCreator(parseInt(specificValue, 10));
      } else if (subCommand === 'tags') {
        logger.log('🏷️ Seeding tags...');
        await tagSeeder.seed();
      } else if (subCommand === 'tags-language' && specificValue) {
        logger.log(`🏷️ Seeding tags for language: ${specificValue}...`);
        await tagSeeder.seedByLanguage(specificValue);
      } else if (subCommand === 'tags-type' && specificValue) {
        logger.log(`🏷️ Seeding tags for type ID: ${specificValue}...`);
        await tagSeeder.seedByType(parseInt(specificValue, 10));
      } else if (subCommand === 'taxes') {
        logger.log('💰 Seeding taxes...');
        await taxSeeder.seed();
      } else if (subCommand === 'taxes-country' && specificValue) {
        logger.log(`💰 Seeding taxes for country: ${specificValue}...`);
        await taxSeeder.seedByCountry(specificValue);
      } else if (subCommand === 'taxes-state' && specificValue) {
        logger.log(`💰 Seeding taxes for state: ${specificValue}...`);
        await taxSeeder.seedByState(specificValue);
      } else if (subCommand === 'taxes-global') {
        logger.log('💰 Seeding global taxes...');
        await taxSeeder.seedByGlobalStatus(true);
      } else if (subCommand === 'terms-and-conditions') {
        logger.log('📋 Seeding terms and conditions...');
        await termsAndConditionsSeeder.seed();
      } else if (subCommand === 'terms-and-conditions-type' && specificValue) {
        logger.log(`📋 Seeding terms and conditions with type: ${specificValue}...`);
        await termsAndConditionsSeeder.seedByType(specificValue);
      } else if (subCommand === 'terms-and-conditions-language' && specificValue) {
        logger.log(`📋 Seeding terms and conditions for language: ${specificValue}...`);
        await termsAndConditionsSeeder.seedByLanguage(specificValue);
      } else if (subCommand === 'terms-and-conditions-approved') {
        logger.log('📋 Seeding approved terms and conditions...');
        await termsAndConditionsSeeder.seedByApprovalStatus(true);
      } else if (subCommand === 'types') {
        logger.log('🏷️ Seeding types...');
        await typeSeeder.seed();
      } else if (subCommand === 'types-language' && specificValue) {
        logger.log(`🏷️ Seeding types for language: ${specificValue}...`);
        await typeSeeder.seedByLanguage(specificValue);
      } else {
        logger.log('📊 Seeding all analytics data...');
        await analyticsSeeder.seed();
      }
    } else {
      logger.log('📦 Running all seeders...');

      await userSeeder.seed();                 // Users first
      await analyticsSeeder.seed();            // Analytics
      await attributesSeeder.seed();           // Attributes
      await authorsSeeder.seed();              // Authors
      await becomeSellerSeeder.seed();         // Become seller
      await typeSeeder.seed();                 // Types (required by categories)
      await categoriesSeeder.seed();           // Categories
      await conversationsSeeder.seed();        // Conversations
      await couponsSeeder.seed();              // Coupons
      await faqsSeeder.seed();                 // FAQs
      await flashSaleSeeder.seed();            // Flash sale
      await manufacturerSeeder.seed();         // Manufacturers
      await messageSeeder.seed();              // Messages
      await orderSeeder.seed();                // Orders
      await ownershipTransferSeeder.seed();    // Ownership transfers
      await paymentSeeder.seed();              // Payment data
      await paymentMethodSeeder.seed();        // Payment methods
      await productSeeder.seed();              // Products
      await shopSeeder.seed();                 // Shops
      await withdrawSeeder.seed();             // Withdraws (after shops)
      await questionSeeder.seed();             // Questions
      await refundPolicySeeder.seed();         // Refund policies
      await refundReasonSeeder.seed();         // Refund reasons
      await reportSeeder.seed();               // Reports
      await reviewSeeder.seed();               // Reviews
      await shippingSeeder.seed();             // Shippings
      await storeNoticeSeeder.seed();          // Store notices
      await tagSeeder.seed();                  // Tags
      await taxSeeder.seed();                  // Taxes
      await termsAndConditionsSeeder.seed();   // Terms and conditions
      await wishlistSeeder.seed();             // Wishlists 
    }

    await appContext.close();

    console.log('='.repeat(60));
    console.log('✅ Seeder completed successfully');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Seeder failed:');
    if (error instanceof Error) {
      console.error('   ' + error.message);
      console.error('\n📋 Error details:');
      console.error(error.stack);
    } else {
      console.error('   ' + String(error));
    }
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  }
}
bootstrap();