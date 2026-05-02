// reports/entities/report.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
 import { User } from 'src/users/entities/user.entity';

@Entity('reports')
export class Report extends CoreEntity {
  @ApiProperty({ description: 'Report ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID who submitted the report', example: 2 })
  @Column()
  user_id: number;

  @ApiProperty({ type: () => User, description: 'User who submitted the report' })
  @ManyToOne(() => User, user => user.reports)
  user: User;

  @ApiProperty({ 
    description: 'Model type being reported', 
    example: 'Marvel\\Database\\Models\\Review' 
  })
  @Column()
  model_type: string;

  @ApiProperty({ description: 'ID of the model being reported', example: 1 })
  @Column()
  model_id: number;

  @ApiProperty({ description: 'Report message', example: 'This is an abusive report' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}