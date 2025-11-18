import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

@Injectable()
export class ImageService {
  private uploadPath = path.join(__dirname, '..', '..', 'uploads');

  constructor() {
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
}
