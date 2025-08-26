import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './core/database/database.service';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);
  const databaseService = app.get(DatabaseService);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE', 'PharmSyCare API'))
    .setDescription('Pharmacy Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  // Startup message
  console.log(`
==========================================
🚀 Application successfully started!
🔹 Environment: ${configService.get('NODE_ENV', 'development')}
🔹 Running on: http://localhost:${port}
🔹 Database: ${configService.get('DB_TYPE')}://${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_NAME')}
🔹 Swagger UI: http://localhost:${port}/api
==========================================
`);
}

bootstrap();
