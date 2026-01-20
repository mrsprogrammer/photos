import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Image } from './image.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  color: string; // hex color for UI display, e.g., #FF5733

  @ManyToMany(() => Image, (image) => image.labels)
  images: Image[];

  @CreateDateColumn()
  createdAt: Date;
}
