import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { S3Service } from './s3.service';
import { ImageRepository } from './image.repository';
import { LabelRepository } from './label.repository';

@Injectable()
export class ImageService {
  private uploadPath = path.join(__dirname, '..', '..', 'uploads');
  private storageType: 'local' | 's3' =
    (process.env.STORAGE_TYPE as any) || 'local';

  constructor(
    private readonly s3Service?: S3Service,
    private readonly imageRepository?: ImageRepository,
    private readonly labelRepository?: LabelRepository,
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
      const filename =
        key ||
        `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
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

  // Label management methods
  async addLabelToImage(imageId: string, labelName: string, color?: string) {
    if (!this.imageRepository || !this.labelRepository) {
      throw new Error('Database not configured');
    }

    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Find or create label
    const label = await this.labelRepository.findOrCreate(labelName, color);

    // Check if label already exists on image
    if (image.labels && image.labels.some((l) => l.id === label.id)) {
      throw new BadRequestException('Label already exists on this image');
    }

    // Add label to image
    if (!image.labels) {
      image.labels = [];
    }
    image.labels.push(label);
    await this.imageRepository.save(image);

    return image;
  }

  async removeLabelFromImage(imageId: string, labelId: string) {
    if (!this.imageRepository || !this.labelRepository) {
      throw new Error('Database not configured');
    }

    const image = await this.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    if (!image.labels || !image.labels.some((l) => l.id === labelId)) {
      throw new NotFoundException('Label not found on this image');
    }

    // Remove label from image
    image.labels = image.labels.filter((l) => l.id !== labelId);
    await this.imageRepository.save(image);

    return image;
  }

  async getAllLabels() {
    if (!this.labelRepository) {
      throw new Error('Database not configured');
    }
    return this.labelRepository.getAllLabels();
  }

  async createLabel(name: string, color?: string) {
    if (!this.labelRepository) {
      throw new Error('Database not configured');
    }

    const existingLabel = await this.labelRepository.findByName(name);
    if (existingLabel) {
      throw new BadRequestException('Label with this name already exists');
    }

    return this.labelRepository.findOrCreate(name, color);
  }

  async deleteLabel(labelId: string) {
    if (!this.labelRepository) {
      throw new Error('Database not configured');
    }
    await this.labelRepository.deleteLabel(labelId);
  }
}
