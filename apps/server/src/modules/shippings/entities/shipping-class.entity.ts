import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ShippingClass extends CoreEntity {
    @ApiProperty({ description: 'Shipping class name' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Shipping class slug (unique)' })
    @Column({ unique: true })
    slug: string;

    @ApiProperty({ description: 'Shipping class description', required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ description: 'Shipping cost', default: 0 })
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cost: number;

    @ApiProperty({ description: 'Is shipping class active', default: true })
    @Column({ type: 'boolean', default: true, name: 'is_active' })
    is_active: boolean;

    @ApiProperty({ description: 'Minimum order amount for free shipping', nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'minimum_order' })
    minimum_order: number;

    @ApiProperty({ description: 'Maximum order weight for this class', nullable: true })
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'maximum_weight' })
    maximum_weight: number;

    @ApiProperty({ description: 'Shipping class type', enum: ['fixed', 'percentage', 'free'], default: 'fixed' })
    @Column({ default: 'fixed' })
    type: 'fixed' | 'percentage' | 'free';

    @ApiProperty({ description: 'Shipping class settings', required: false })
    @Column({ type: 'json', nullable: true })
    settings: Record<string, any>;

    @ApiProperty({ description: 'Language code', default: 'en' })
    @Column({ default: 'en' })
    language: string;

    @ApiProperty({ description: 'Translated languages', type: [String], nullable: true })
    @Column('simple-array', { nullable: true })
    translated_languages: string[];
}