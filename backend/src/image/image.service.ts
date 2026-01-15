import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Service } from './s3.service';
import { ImageRepository } from './image.repository';

@Injectable()
export class ImageService {
  private uploadPath = path.join(__dirname, '..', '..', 'uploads');
  private storageType: 'local' | 's3' =
    (process.env.STORAGE_TYPE as any) || 'local';

  constructor(
    private readonly s3Service?: S3Service,
    private readonly imageRepository?: ImageRepository,
  ) {
    // Create uploads directory only for local storage
    if (this.storageType === 'local' && !fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
    console.log(`ImageService configured with storage: ${this.storageType}`);
  }

  async saveImage(file: Express.Multer.File, key?: string): Promise<string> {
    // Resize image to 800x800
    const buffer = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside' })
      .toBuffer();

    if (this.storageType === 's3') {
      // Save to S3
      const s3Key = key || `uploads/${Date.now()}-${file.originalname}`;
      if (!this.s3Service) throw new Error('S3Service not configured');
      await this.s3Service.uploadFile(s3Key, buffer, file.mimetype);
      return s3Key;
    } else {
      // Save to local filesystem
      const filename = key || `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
      const filePath = path.join(this.uploadPath, filename);
      await fs.promises.writeFile(filePath, buffer);
      return filename;
    }
  }

  async getPresignedGetUrl(key: string) {
    if (this.storageType === 's3' && this.s3Service?.hasBucket()) {
      return await this.s3Service.getPresignedGetUrl(key);
    }
    // fallback: local static path with full URL
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3002';
    const path = key.startsWith('/') ? key : `/uploads/${key}`;
    return `${baseUrl}${path}`;
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
