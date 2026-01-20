import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Label } from './label.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // FK or user identifier

  @Column()
  s3Key: string; // S3 bucket key (path to object)

  @Column()
  filename: string; // original filename

  @Column({ type: 'bigint', nullable: true })
  fileSize: number; // file size in bytes

  @Column({ nullable: true })
  contentType: string; // mime type

  @Column({ default: 'active' })
  status: string; // active, deleted, archived

  @ManyToMany(() => Label, (label) => label.images)
  @JoinTable({
    name: 'image_labels',
    joinColumn: { name: 'imageId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'labelId', referencedColumnName: 'id' },
  })
  labels: Label[];

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
