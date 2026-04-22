// main.ts
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
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Marvel API')
    .setDescription('Marvel E-commerce API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT-Access Token',
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
        bearerFormat: 'JWT-Refresh Token',
        name: 'Refresh Token',
        description: 'Enter refresh token',
        in: 'header',
      },
      'refresh-token',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  // main.ts - add this after database connection test
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

  // Call this function in bootstrap after database connection
  // Add this line in bootstrap after testDatabaseConnection(app)
  await runSeeders(app);
  
  // Display application information
  console.log('\n' + '='.repeat(60));
  console.log('🚀 MARVEL API - Server Started Successfully');
  console.log('='.repeat(60));
  console.log(`📡 Server     : http://localhost:${PORT}/api`);
  console.log(`📚 Swagger    : http://localhost:${PORT}/docs`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database   : ${(process.env.DB_TYPE || process.env.DATABASE_TYPE || 'mysql').toUpperCase()}`);
  console.log(`📍 Location   : ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || process.env.DATABASE_NAME || 'da2db'}`);
  console.log('='.repeat(60));
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