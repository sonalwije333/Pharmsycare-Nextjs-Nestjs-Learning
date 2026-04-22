import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.testDatabaseConnection();
    await this.synchronizeDatabase();
  }

  private async testDatabaseConnection() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('🔌 Successfully connected to MySQL database');
      this.logConnectionDetails();
    } catch (error) {
      this.logger.error('❌ Failed to connect to MySQL database:', error.message);
      throw error;
    }
  }

  private async synchronizeDatabase() {
    const shouldSync = this.configService.get<boolean>('DB_SYNC', false);
    if (shouldSync) {
      this.logger.warn('🔄 Starting database schema synchronization (use only in development!)');
      try {
        await this.dataSource.synchronize();
        this.logger.log('✅ Database synchronization completed successfully');
      } catch (error) {
        this.logger.error('❌ Database synchronization failed:', error.message);
        throw error;
      }
    }
  }

  private logConnectionDetails() {
    const dbConfig = {
      type: this.configService.get('DB_TYPE'),
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      database: this.configService.get('DB_NAME'),
    };
    this.logger.log(`📊 Connected to: ${dbConfig.type}://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  }
}