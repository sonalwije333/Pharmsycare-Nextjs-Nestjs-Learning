import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import * as Joi from 'joi';
import { SettingsModule } from './modules/settings/settings.module';
import { TypesModule } from './modules/types/types.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { CommonModule } from './modules/common/common.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { FeedbackModule } from './modules/feedbacks/feedbacks.module';
import { FlashSaleModule } from './modules/flash-sale/flash-sale.module';
import { ImportsModule } from './modules/imports/imports.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NewslettersModule } from './modules/newsletters/newsletters.module';
import { NotifyLogsModule } from './modules/notify-logs/notify-logs.module';
import { WithdrawsModule } from './modules/withdraws/withdraws.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { QuestionModule } from './modules/questions/questions.module';
import { RefundPoliciesModule } from './modules/refund-policies/refund-policies.module';
import { RefundReasonModule } from './modules/refund-reasons/refund-reasons.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReviewModule } from './modules/reviews/reviews.module';
import { ShippingsModule } from './modules/shippings/shippings.module';
import { StoreNoticesModule } from './modules/store-notices/store-notices.module';
import { TagsModule } from './modules/tags/tags.module';
import { TaxesModule } from './modules/taxes/taxes.module';
import { TermsAndConditionsModule } from './modules/terms-and-conditions/terms-and-conditions.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { WebHookModule } from './modules/web-hook/web-hook.module';
import { PaymentIntentModule } from './modules/payment-intent/payment-intent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DB_TYPE: Joi.string().valid('mysql', 'mariadb').default('mysql'),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().port().default(3306),
        DB_USERNAME: Joi.string().default('root'),
        DB_PASSWORD: Joi.string().allow(''),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().default(false),
        DB_LOGGING: Joi.boolean().default(false),
      }),
    }),
    DatabaseModule,
    CoreModule,
    SharedModule,
    AddressesModule,
    AiModule,
    AnalyticsModule,
    AuthModule,
    AuthorsModule,
    CategoriesModule,
    CommonModule,
    ConversationsModule,
    CouponsModule,
    FaqsModule,
    FeedbackModule,
    FlashSaleModule,
    ImportsModule,
    ManufacturersModule,
    MessagesModule,
    NewslettersModule,
    NotifyLogsModule,
    // OrdersModule,
    PaymentModule,
    PaymentIntentModule,
    PaymentMethodModule,
    ProductsModule,
    QuestionModule,
    RefundPoliciesModule,
    RefundReasonModule,
    RefundsModule,
    ReportsModule,
    ReviewModule,
    SettingsModule,
    ShippingsModule,
    //ShopsModule,
    StoreNoticesModule,
    TagsModule,
    TaxesModule,
    TermsAndConditionsModule,
    TypesModule,
    UploadsModule,
    UsersModule,
    WebHookModule,
    WishlistsModule,
    WithdrawsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
