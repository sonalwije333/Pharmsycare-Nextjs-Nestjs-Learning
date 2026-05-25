import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  
  // Test database connection
  await testDatabaseConnection(app);
  
  // Swagger configuration - FIXED VERSION
  const config = new DocumentBuilder()
    .setTitle('PharmSyCare API')
    .setDescription('PharmSyCare E-commerce API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh Token',
        description: 'Enter refresh token',
        in: 'header',
      },
      'refresh-token',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // CRITICAL FIX: Swagger setup with options to prevent freezing
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',           // Collapse all tags by default - prevents freezing
      defaultModelsExpandDepth: -1,   // Hide the models/schemas section
      defaultModelExpandDepth: 0,     // Don't expand models
      filter: true,                   // Enable search/filter
      persistAuthorization: true,     // Keep auth token after page refresh
      tryItOutEnabled: false,         // Disable "Try it out" by default (optional)
      syntaxHighlight: {
        activate: true,
        theme: 'agate',
      },
    },
    customCss: '.swagger-ui .topbar { display: none }', // Optional: cleaner UI
    customSiteTitle: 'PharmSyCare API Documentation',
  });
  
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  // Run seeders function
  await runSeeders(app);
  
  // Display application information
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PharmSyCare API - Server Started Successfully');
  console.log('='.repeat(60));
  console.log(`📡 Server     : http://localhost:${PORT}/api`);
  console.log(`📚 Swagger    : http://localhost:${PORT}/docs`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database   : ${(process.env.DB_TYPE || process.env.DATABASE_TYPE || 'mysql').toUpperCase()}`);
  console.log(`📍 Location   : ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || process.env.DATABASE_NAME || 'da2db'}`);
  console.log('='.repeat(60));
  
  // Additional debug info for Swagger
  // console.log('\n📚 Swagger Configuration:');
  // console.log(`   - UI URL: http://localhost:${PORT}/docs`);
  // console.log(`   - Doc Expansion: none (prevents freezing)`);
  // console.log(`   - Models Section: hidden`);
  // console.log(`   - Filter: enabled`);
  // console.log('='.repeat(60) + '\n');
}

async function runSeeders(app: any) {
  const shouldRunSeed =
    process.env.RUN_SEED === 'true' && process.env.FORCE_RESEED === 'true';
  
  if (shouldRunSeed) {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 Running database seeders...');
    console.log('='.repeat(60));
    
    try {
      // Use the correct path to your seeder module
      const { SeederModule } = require('./config/database/seeders/seeder.module');
      const { UserSeederService } = require('./config/database/seeders/user-seeder.service');
      
      const seederContext = await NestFactory.createApplicationContext(SeederModule);
      const userSeeder = seederContext.get(UserSeederService);
      
      await userSeeder.seed();
      await seederContext.close();
      
      console.log('='.repeat(60));
      console.log('✅ Database seeders completed successfully');
      console.log('='.repeat(60) + '\n');
      
    } catch (error) {
      console.error('\n❌ Database seeders failed:');
      console.error('   ' + error.message);
      console.error('\n📋 Error details:');
      console.error(error.stack);
      console.log('\n' + '='.repeat(60) + '\n');
    }
  } else if (process.env.RUN_SEED === 'true') {
    console.log('ℹ️ RUN_SEED=true detected but skipped to protect existing DB data.');
    console.log('   Set FORCE_RESEED=true to run destructive reseeding explicitly.');
  }
}

async function testDatabaseConnection(app: any) {
  try {
    console.log('\n🔍 Testing Database Connection...');
    
    const dataSource = app.get(DataSource);
    await dataSource.query('SELECT 1');
    
    const dbType = process.env.DB_TYPE || process.env.DATABASE_TYPE || 'mysql';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || process.env.DB_PORT || '3306';
    const dbName = process.env.DB_NAME || process.env.DATABASE_NAME || 'da2db';
    
    console.log('✅ Database Connected Successfully!');
    console.log('   └─ Type    : ' + dbType.toUpperCase());
    console.log('   └─ Location: ' + dbHost + ':' + dbPort);
    console.log('   └─ Database: ' + dbName);
    console.log('');
    
  } catch (error) {
    console.log('\n❌ Database Connection Failed!');
    console.log('   └─ Error: ' + error.message);
    console.log('');
    console.log('📋 Current Database Configuration:');
    console.log('   └─ DB_TYPE     : ' + (process.env.DB_TYPE || 'mysql'));
    console.log('   └─ DB_HOST     : ' + (process.env.DB_HOST || 'localhost'));
    console.log('   └─ DB_PORT     : ' + (process.env.DB_PORT || '3306'));
    console.log('   └─ DB_USERNAME : ' + (process.env.DB_USERNAME || 'root'));
    console.log('   └─ DB_PASSWORD : ' + (process.env.DB_PASSWORD ? '******' : '(empty)'));
    console.log('   └─ DB_NAME     : ' + (process.env.DB_NAME || 'da2db'));
    console.log('');
    console.log('💡 Quick Fixes:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check if database "' + (process.env.DB_NAME || 'da2db') + '" exists');
    console.log('   3. Try empty password: DB_PASSWORD=');
    console.log('   4. Try port 3306: DB_PORT=3306');
    console.log('');
    
    throw error;
  }
}

bootstrap();