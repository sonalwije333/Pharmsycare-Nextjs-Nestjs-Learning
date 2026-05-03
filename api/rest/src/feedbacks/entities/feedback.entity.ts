import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { ModelType } from 'src/common/enums/model-type.enum';
import { Review } from 'src/reviews/entities/review.entity';

@Entity('feedbacks')
@Index(['model_type', 'model_id'])
export class Feedback extends CoreEntity {
  @ApiProperty({ description: 'Feedback ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID', example: '123', type: String })
  @Column()
  user_id: string;

  @ApiProperty({
    description: 'Model type (e.g., product, order)',
    example: ModelType.PRODUCT,
    enum: ModelType,
  })
  @Column({ type: 'varchar' })
  model_type: string;

  @ApiProperty({
    description: 'Model ID (e.g., product ID, order ID)',
    example: '456',
    type: String,
  })
  @Column()
  model_id: string;

  @ApiProperty({
    description: 'Positive feedback',
    example: true,
    required: false,
    default: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: true, default: false })
  positive?: boolean;

  @ApiProperty({
    description: 'Negative feedback',
    example: false,
    required: false,
    default: false,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: true, default: false })
  negative?: boolean;

  // Hidden from Swagger to avoid circular dependency
  @ApiHideProperty()
  @Column({ nullable: true })
  review_id?: number;

  @ApiHideProperty()
  @ManyToOne(() => Review, review => review.feedbacks)
  review?: Review;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}