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
    UsersModule,
    SettingsModule,
    AuthModule,
    // ... other modules
    TypesModule,
    CategoriesModule,
    ProductsModule,
    ManufacturersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
