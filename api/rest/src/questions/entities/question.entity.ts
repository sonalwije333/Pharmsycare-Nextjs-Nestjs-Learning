// src/questions/entities/question.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Entity('questions')
export class Question {
  @ApiProperty({ description: 'Question ID', example: 68 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID who asked the question', example: 2 })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Product ID the question is about', example: 470 })
  @Column()
  product_id!: number;

  @ApiProperty({ description: 'Shop ID', example: 5 })
  @Column()
  shop_id: number;

  @ApiProperty({ description: 'Question text', example: 'Is it sweet or sour?' })
  @Column({ type: 'text' })
  question: string;

  @ApiProperty({ description: 'Answer text', required: false, example: 'its sweet as it contains sugar.' })
  @Column({ type: 'text', nullable: true })
  answer: string;

  @ApiProperty({ description: 'Number of positive feedbacks', default: 0 })
  @Column({ default: 0 })
  positive_feedbacks_count: number;

  @ApiProperty({ description: 'Number of negative feedbacks', default: 0 })
  @Column({ default: 0 })
  negative_feedbacks_count: number;

  @ApiProperty({ description: 'Number of abusive reports', default: 0 })
  @Column({ default: 0 })
  abusive_reports_count: number;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ nullable: true })
  deleted_at: Date;

  @ApiProperty({ type: () => Product, description: 'Associated product' })
  @ManyToOne(() => Product, product => product.questions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ type: () => User, description: 'User who asked the question' })
  @ManyToOne(() => User, user => user.questions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @ApiProperty({ type: () => Shop, description: 'Associated shop' })
  // @ManyToOne(() => Shop, shop => shop.questions)
  // @JoinColumn({ name: 'shop_id' })
  // shop: Shop;

  @ApiProperty({ description: 'User feedback on this question' })
  my_feedback?: any;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}