// src/modules/social/entities/social.entity.ts
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Social extends CoreEntity {
    @ApiProperty({ example: 'twitter', description: 'Social media platform type' })
    @Column()
    type: string;

    @ApiProperty({ example: 'https://twitter.com/username', description: 'Social media profile URL' })
    @Column()
    link: string;

    @ApiProperty({ type: () => Profile, description: 'Associated profile' })
    @ManyToOne(() => Profile, (profile) => profile.socials, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;
}