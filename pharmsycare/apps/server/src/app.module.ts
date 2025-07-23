// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TypesModule } from './modules/types/types.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RequestContextMiddleware } from './middleware/request-context.middleware';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CoreModule,
    SharedModule,
    UsersModule,
    AuthModule,
    SettingsModule,
    TypesModule,
    CategoriesModule,
    ManufacturersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*'); // Apply it globally or to specific routes
  }
}
