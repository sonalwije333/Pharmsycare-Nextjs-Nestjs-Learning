// src/config/database/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../../users/entities/user.entity';
import { Profile } from '../../../users/entities/profile.entity';
import { Address } from '../../../addresses/entities/address.entity';
import { UserSeederService } from './user-seeder.service';
import { AnalyticsSeederService } from './analytics-seeder.service';
import { AttributesSeederService } from './attributes-seeder.service';
import { UsersService } from '../../../users/users.service';
import { AnalyticsService } from '../../../analytics/analytics.service';
import { Analytics } from '../../../analytics/entities/analytics.entity';
import { CategoryWiseProduct } from '../../../analytics/entities/category-wise-product.entity';
import { TopRateProduct } from '../../../analytics/entities/top-rate-product.entity';
import { Attribute } from '../../../attributes/entities/attribute.entity';
import { AttributeValue } from '../../../attributes/entities/attribute-value.entity';
import { AttributesService } from '../../../attributes/attributes.service';
import { Author } from '../../../authors/entities/author.entity';
import { AuthorsService } from '../../../authors/authors.service';
import { AuthorsSeederService } from './authors-seeder.service';
import { BecomeSeller } from '../../../become-seller/entities/become-seller.entity';
import { BecomeSellerService } from '../../../become-seller/become-seller.service';
import { BecomeSellerSeederService } from './become-seller-seeder.service';
import { CategoriesService } from '../../../categories/categories.service';
import { CategoriesSeederService } from './categories-seeder.service';
import { Category } from '../../../categories/entities/category.entity';
import { ConversationsService } from '../../../conversations/conversations.service';
import { ConversationsSeederService } from './conversations-seeder.service';
import { Conversation } from '../../../conversations/entities/conversation.entity';
import { LatestMessage } from '../../../conversations/entities/latest-message.entity';
import { Coupon } from '../../../coupons/entities/coupon.entity';
import { CouponsSeederService } from './coupons-seeder.service';
import { CouponsService } from '../../../coupons/coupons.service';
import { Faq } from '../../../faqs/entities/faq.entity';
import { FaqsService } from '../../../faqs/faqs.service';
import { FaqsSeederService } from './faqs-seeder.service';
import { FlashSale } from '../../../flash-sale/entities/flash-sale.entity';
import { FlashSaleService } from '../../../flash-sale/flash-sale.service';
import { FlashSaleSeederService } from './flash-sale-seeder.service';
import { Manufacturer } from '../../../manufacturers/entities/manufacturer.entity';
import { ManufacturerSeederService } from './manufacturer-seeder.service';
import { ManufacturersService } from '../../../manufacturers/manufacturers.service';
import { Message } from '../../../messages/entities/message.entity';
import { MessagesService } from '../../../messages/messages.service';
import { MessageSeederService } from './messages-seeder.service';
import { Order } from '../../../orders/entities/order.entity';
import { OrderStatus } from '../../../orders/entities/order-status.entity';
import { OrderFiles } from '../../../orders/entities/order.entity';
import { OrderSeederService } from './order-seeder.service';
import { OwnershipTransfer } from '../../../ownership-transfer/entities/ownership-transfer.entity';
import { OwnershipTransferSeederService } from './ownership-transfer-seeder.service';
import { PayPalPayment, PayPalRefund } from 'src/payment/entities/paypal.entity';
import { StripeCustomer, StripePayment, StripeRefund } from 'src/payment/entities/stripe.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';
import { PaymentGateWay } from 'src/payment-method/entities/payment-gateway.entity';
import { PaymentSeederService } from './payment-seeder.service';
import { PaymentMethodSeederService } from './payment-method-seeder.service';

// Import Product related modules
import { Product } from '../../../products/entities/product.entity';
import { Type } from '../../../types/entities/type.entity';
import { Tag } from '../../../tags/entities/tag.entity';
import { Shop } from '../../../shops/entities/shop.entity';
import { ProductSeederService } from './product-seeder.service';
import { ProductsService } from '../../../products/products.service';
import { TypesService } from '../../../types/types.service';
import { TagsService } from '../../../tags/tags.service';
import { ShopsService } from '../../../shops/shops.service';

// Import Question related modules
import { Question } from '../../../questions/entities/question.entity';
import { QuestionSeederService } from './question-seeder.service';
import { QuestionsService } from '../../../questions/questions.service';
import { MyQuestionsService } from '../../../questions/my-questions.service';

// Import Refund Policy related modules
import { RefundPolicy } from '../../../refund-policies/entities/refund-policies.entity';
import { RefundPolicySeederService } from './refund-policy-seeder.service';
import { RefundPoliciesService } from '../../../refund-policies/refund-policies.service';

// Import Refund Reason related modules
import { RefundReason } from '../../../refund-reasons/entities/refund-reasons.entity';
import { RefundReasonSeederService } from './refund-reason-seeder.service';
import { RefundReasonsService } from '../../../refund-reasons/refund-reasons.service';

// Import Report related modules
import { Report } from '../../../reports/entities/report.entity';
import { ReportSeederService } from './report-seeder.service';
import { ReportsService } from '../../../reports/reports.service';

// Import Review related modules
import { Review } from '../../../reviews/entities/review.entity';
import { ReviewSeederService } from './review-seeder.service';
import { ReviewService } from '../../../reviews/reviews.service';
import { ShippingSeederService } from './shipping-seeder.service';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { ShippingsService } from 'src/shippings/shippings.service';
import { ShopSeederService } from './shop-seeder.service';



@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3307),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'da2db'),
        entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('DB_LOGGING', true),
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Profile,
      Address,
      Analytics,
      CategoryWiseProduct,
      TopRateProduct,
      Attribute,
      AttributeValue,
      Author,
      BecomeSeller,
      Category,
      Conversation,
      LatestMessage,
      Coupon,
      Faq,
      FlashSale,
      Manufacturer,
      Message,
      Order,
      OrderStatus,
      OrderFiles,
      OwnershipTransfer,
      PayPalPayment,
      PayPalRefund,
      StripePayment,
      StripeCustomer,
      StripeRefund,
      PaymentMethod,
      PaymentGateWay,
      Product,
      Type,
      Tag,
      Shop,
      Question,
      RefundPolicy,
      RefundReason,
      Report,
      Review,
      Shipping,
    ]),
  ],
  providers: [
    // User seeders
    UserSeederService,
    UsersService,

    // Analytics seeders
    AnalyticsSeederService,
    AnalyticsService,

    // Attributes seeders
    AttributesSeederService,
    AttributesService,

    // Author seeders
    AuthorsService,
    AuthorsSeederService,

    // Become Seller seeders
    BecomeSellerService,
    BecomeSellerSeederService,

    // Category seeders
    CategoriesService,
    CategoriesSeederService,

    // Conversation seeders
    ConversationsService,
    ConversationsSeederService,

    // Coupon seeders
    CouponsSeederService,
    CouponsService,

    // Faq seeders
    FaqsSeederService,
    FaqsService,

    // FlashSale seeders
    FlashSaleSeederService,
    FlashSaleService,

    // Manufacturer seeders
    ManufacturerSeederService,
    ManufacturersService,

    // Message seeders
    MessageSeederService,
    MessagesService,

    // Order seeders
    OrderSeederService,

    // Ownership Transfer seeders
    OwnershipTransferSeederService,

    // Payment seeders
    PaymentSeederService,
    PaymentMethodSeederService,

    // Product related seeders
    ProductSeederService,
    ProductsService,
    TypesService,
    TagsService,
    ShopsService,

    // Question related seeders
    QuestionSeederService,
    QuestionsService,
    MyQuestionsService,

    // Refund Policy related seeders
    RefundPolicySeederService,
    RefundPoliciesService,

    // Refund Reason related seeders
    RefundReasonSeederService,
    RefundReasonsService,

    // Report related seeders
    ReportSeederService,
    ReportsService,

    // Review related seeders
    ReviewSeederService,
    ReviewService,

    // Shipping related seeders
    ShippingSeederService,
    ShippingsService,

    // Shop related seeders
    ShopSeederService,
  ],
  exports: [
    UserSeederService,
    AnalyticsSeederService,
    AttributesSeederService,
    AuthorsSeederService,
    BecomeSellerSeederService,
    CategoriesSeederService,
    ConversationsSeederService,
    CouponsSeederService,
    FaqsSeederService,
    FlashSaleSeederService,
    ManufacturerSeederService,
    MessageSeederService,
    OrderSeederService,
    OwnershipTransferSeederService,
    PaymentSeederService,
    PaymentMethodSeederService,
    ProductSeederService,
    ProductsService,
    TypesService,
    TagsService,
    ShopsService,
    QuestionSeederService,
    QuestionsService,
    MyQuestionsService,
    RefundPolicySeederService,
    RefundPoliciesService,
    RefundReasonSeederService,
    RefundReasonsService,
    ReportSeederService,
    ReportsService,
    ReviewSeederService,
    ReviewService,
    ShippingSeederService,
    ShippingsService,
    ShopSeederService,
  ],
})
export class SeederModule {}