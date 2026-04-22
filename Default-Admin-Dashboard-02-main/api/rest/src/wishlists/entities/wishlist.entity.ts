// wishlists/entities/wishlist.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';


@Entity('wishlists')
export class Wishlist extends CoreEntity {
  @ApiProperty({ description: 'Wishlist ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Product, description: 'Product in wishlist' })
  @ManyToOne(() => Product, product => product.wishlists)
  product: Product;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @Column()
  product_id: number;

  @ApiProperty({ type: () => [User], description: 'Users who added to wishlist' })
  @ManyToOne(() => User, user => user.wishlists)
  user: User;

  @ApiProperty({ description: 'User ID', example: 1 })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}