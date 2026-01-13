import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Image } from './image.entity';

@Injectable()
export class ImageRepository extends Repository<Image> {
  constructor(private dataSource: DataSource) {
    super(Image, dataSource.createEntityManager());
  }

  async createImage(data: {
    userId: string;
    s3Key: string;
    filename: string;
    fileSize?: number;
    contentType?: string;
  }): Promise<Image> {
    const image = this.create({
      ...data,
      status: 'active',
    });
    return this.save(image);
  }

  async findByUser(userId: string): Promise<Image[]> {
    return this.find({
      where: { userId, status: 'active' },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Image | null> {
    return this.findOne({ where: { id, status: 'active' } });
  }

  async softDelete(id: string) {
    return this.update(id, { status: 'deleted' });
  }
}
