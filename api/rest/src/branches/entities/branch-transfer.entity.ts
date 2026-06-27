import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

// Audit record of a stock transfer between two branches (branch coordination).
@Entity('branch_transfers')
export class BranchTransfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column({ nullable: true })
  product_name: string | null;

  @Column()
  from_branch_id: number;

  @Column({ nullable: true })
  from_branch_name: string | null;

  @Column()
  to_branch_id: number;

  @Column({ nullable: true })
  to_branch_name: string | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  created_at: Date;
}
