// users/entities/profile.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends CoreEntity {
  @ApiProperty({ description: 'Profile ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer with 5 years experience',
    required: false,
  })
  @Column({ nullable: true })
  bio?: string;

  @ApiProperty({
    type: 'json',
    description: 'Social media links',
    example: [{ type: 'twitter', link: 'https://twitter.com/johndoe' }],
    required: false,
  })
  @Column('json', { nullable: true })
  socials?: Social[];

  @ApiProperty({
    description: 'Contact information',
    example: '+1234567890',
    required: false,
  })
  @Column({ nullable: true })
  contact?: string;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @OneToOne(() => User, (user) => user.profile)
  customer?: User;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}

export class Social {
  @ApiProperty({ example: 'twitter', description: 'Social platform type' })
  type: string;

  @ApiProperty({
    example: 'https://twitter.com/johndoe',
    description: 'Social profile link',
  })
  link: string;
}
