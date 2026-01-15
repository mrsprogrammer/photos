import {
  Controller,
  Post,
  Get,
  Delete,
  UploadedFile,
  UseInterceptors,
  Body,
  Query,
  Param,
  BadRequestException,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body?: { key?: string },
  ) {
    const key = body?.key;
    const result = await this.imageService.saveImage(file, key);
    return { key: result };
  }

  // returns presigned PUT url (S3) or direct upload URL (local)
  @Post('sign')
  async sign(
    @Body() body: { filename?: string; contentType?: string },
    @Query('userId') userId?: string,
  ) {
    const storageType = process.env.STORAGE_TYPE || 'local';
    const { filename, contentType } = body || {};
    if (!filename || !contentType)
      throw new BadRequestException('filename and contentType required');

    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '-');

    if (storageType === 's3') {
      if (!this.s3Service.hasBucket()) {
        throw new BadRequestException('S3 not configured on server');
      }
      // For S3: include userId in the key
      const key = `${userId || 'anonymous'}/${Date.now()}-${safeName}`;
      const url = await this.s3Service.getPresignedPutUrl(key, contentType);
      return { url, key };
    } else {
      // For local: key without userId (will be stored in uploads/ root)
      const key = `${Date.now()}-${safeName}`;
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3002';
      return { url: `${backendUrl}/images/upload`, key };
    }
  }

  // save image metadata after successful S3 upload
  @Post()
  @UseGuards(JwtAuthGuard)
  async saveImageMetadata(
    @Body()
    body: {
      s3Key: string;
      filename: string;
      fileSize?: number;
      contentType?: string;
    },
    @Req() req: any,
  ) {
    const { s3Key, filename, fileSize, contentType } = body;
    if (!s3Key || !filename) {
      throw new BadRequestException('s3Key and filename are required');
    }

    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    // Check image limit (10 per user)
    const userImages = await this.imageService.getUserImages(userId);
    if (userImages.length >= 10) {
      throw new BadRequestException(
        'Image limit reached (max 10 images per user)',
      );
    }

    const image = await this.imageService.saveImageMetadata({
      userId,
      s3Key,
      filename,
      fileSize,
      contentType,
    });

    return {
      id: image.id,
      s3Key: image.s3Key,
      filename: image.filename,
      fileSize: image.fileSize,
      uploadedAt: image.uploadedAt,
    };
  }

  // get all images for authenticated user
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserImages(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const images = await this.imageService.getUserImages(userId);
    return Promise.all(
      images.map(async (img) => {
        const url = await this.imageService.getPresignedGetUrl(img.s3Key);
        return {
          id: img.id,
          filename: img.filename,
          fileSize: img.fileSize,
          uploadedAt: img.uploadedAt,
          s3Key: img.s3Key,
          url,
        };
      }),
    );
  }

  // get single image metadata
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getImage(@Param('id') imageId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const image = await this.imageService.getImage(imageId);

    if (!image || image.userId !== userId) {
      throw new BadRequestException('Image not found or access denied');
    }

    const url = await this.imageService.getPresignedGetUrl(image.s3Key);
    return {
      id: image.id,
      filename: image.filename,
      fileSize: image.fileSize,
      uploadedAt: image.uploadedAt,
      s3Key: image.s3Key,
      url,
    };
  }

  // delete image (soft delete)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteImage(@Param('id') imageId: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    const image = await this.imageService.getImage(imageId);

    if (!image || image.userId !== userId) {
      throw new BadRequestException('Image not found or access denied');
    }

    await this.imageService.deleteImage(imageId);
    return;
  }
}
