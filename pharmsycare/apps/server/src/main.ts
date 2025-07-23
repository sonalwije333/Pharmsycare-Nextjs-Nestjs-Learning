// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './core/database/database.service';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'debug', 'log', 'warn', 'error'],
  });
  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true, // if you're using cookies/auth headers
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown props
      forbidNonWhitelisted: true, // throws if extra props are sent
      transform: true, // transforms types (e.g., strings to enums)
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  const configService = app.get(ConfigService);
  const databaseService = app.get(DatabaseService);
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE', 'Your API Title'))
    .setDescription(
      configService.get<string>('SWAGGER_DESCRIPTION', 'API Description'),
    )
    .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token', // <- This name will be used in the decorator
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    configService.get<string>('SWAGGER_PATH', 'api'),
    app,
    document,
  );
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  // Display final confirmation
  console.log('\n==========================================');
  console.log('🚀 Application successfully started!');
  console.log(
    `🔹 Environment: ${configService.get('NODE_ENV', 'development')}`,
  );
  console.log(`🔹 Running on: http://localhost:${port}`);
  console.log(
    `🔹 Database: ${path.resolve(configService.get('DATABASE_NAME', '../../database/sqlite/pharmsycaredb.sqlite'))}`,
  );
  console.log(
    `🔹 Swagger UI: http://localhost:${port}/${configService.get('SWAGGER_PATH', 'api')}`,
  );
  console.log('==========================================\n');
}
bootstrap();
