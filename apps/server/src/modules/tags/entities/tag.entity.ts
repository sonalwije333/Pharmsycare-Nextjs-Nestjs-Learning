import { CoreEntity } from "../../common/entities/core.entity";
import { Attachment } from "../../common/entities/attachment.entity";
import { Type } from "../../types/entities/type.entity";
import { Product } from "../../products/entities/product.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne } from "typeorm";

@Entity()
export class Tag extends CoreEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    parent: number;

    @Column({ type: 'text', nullable: true })
    details: string;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    image: Attachment;

    @Column({ nullable: true })
    icon: string;

    @ManyToOne(() => Type, { eager: true, nullable: true })
    @JoinColumn()
    type: Type;

    // @ManyToMany(() => Product, product => product.tags)
    // products: Product[];

    @Column({ default: 'en' })
    language: string;

    @Column({ type: 'json', nullable: true })
    translated_languages: string[];
}