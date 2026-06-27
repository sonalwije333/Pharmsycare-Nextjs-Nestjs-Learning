import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BranchInventory } from './branch-inventory.entity';
import { User } from '../../users/entities/user.entity';

// A physical pharmacy location/branch participating in the multi-branch network.
@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ default: 'General' })
  city: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  manager_name: string | null;

  // The main / head-office branch used as the default fallback for coordination.
  @Column({ default: false })
  is_main: boolean;

  @Column({ default: true })
  is_active: boolean;

  // The vendor (store-owner user) that operates this branch.
  @Column({ nullable: true })
  vendor_id: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: User | null;

  @OneToMany(() => BranchInventory, (inventory) => inventory.branch)
  inventory: BranchInventory[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
