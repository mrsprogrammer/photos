import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Service } from './s3.service';
import { ImageRepository } from './image.repository';

@Injectable()
export class ImageService {
  private uploadPath = path.join(__dirname, '..', '..', 'uploads');
  constructor(
    private readonly s3Service?: S3Service,
    private readonly imageRepository?: ImageRepository,
  ) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async saveImage(file: Express.Multer.File): Promise<string> {
    const filePath = path.join(this.uploadPath, file.originalname);

    // image size to 800x800
    await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside' })
      .toFile(filePath);

    return `/uploads/${file.originalname}`; // URL download
  }

  async getPresignedGetUrl(key: string) {
    if (this.s3Service && this.s3Service.hasBucket()) {
      return await this.s3Service.getPresignedGetUrl(key);
    }
    // fallback: local static path (assuming served by express static)
    return `/uploads/${key}`;
  }

  async saveImageMetadata(data: {
    userId: string;
    s3Key: string;
    filename: string;
    fileSize?: number;
    contentType?: string;
  }) {
    if (!this.imageRepository) {
      throw new Error('Database not configured');
    }
    return this.imageRepository.createImage(data);
  }

  async getUserImages(userId: string) {
    if (!this.imageRepository) {
      throw new Error('Database not configured');
    }
    return this.imageRepository.findByUser(userId);
  }

  async getImage(imageId: string) {
    if (!this.imageRepository) {
      throw new Error('Database not configured');
    }
    return this.imageRepository.findById(imageId);
  }

  async deleteImage(imageId: string) {
    if (!this.imageRepository) {
      throw new Error('Database not configured');
    }
    return this.imageRepository.softDelete(imageId);
  }
}
