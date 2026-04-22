// common/entities/core.entity.ts
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CoreEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn() 
  id: number;

  @ApiProperty()
  @Type(() => Date)
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @Type(() => Date)
  @UpdateDateColumn()
  updated_at: Date;
}