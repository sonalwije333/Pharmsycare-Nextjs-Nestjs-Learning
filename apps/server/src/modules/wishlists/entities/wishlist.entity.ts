import { CoreEntity } from '../../common/entities/core.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Wishlist extends CoreEntity {
    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    product_id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;
}