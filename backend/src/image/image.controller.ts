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
  async getUserImages(@Req() req: any, @Query('labels') labels?: string) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const images = await this.imageService.getUserImages(userId);

    // Filter by labels if provided
    let filteredImages = images;
    if (labels) {
      const labelArray = labels.split(',').map((l) => l.trim().toLowerCase());
      filteredImages = images.filter((img) =>
        labelArray.every((labelName) =>
          img.labels?.some((label) => label.name.toLowerCase() === labelName),
        ),
      );
    }

    return Promise.all(
      filteredImages.map(async (img) => {
        const url = await this.imageService.getPresignedGetUrl(img.s3Key);
        return {
          id: img.id,
          filename: img.filename,
          fileSize: img.fileSize,
          uploadedAt: img.uploadedAt,
          s3Key: img.s3Key,
          url,
          labels: img.labels || [],
        };
      }),
    );
  }

  // Get all available labels - MUST BE BEFORE :id routes
  @Get('labels/all')
  @UseGuards(JwtAuthGuard)
  async getAllLabels() {
    return this.imageService.getAllLabels();
  }

  // Create new label - MUST BE BEFORE :id routes
  @Post('labels/new')
  @UseGuards(JwtAuthGuard)
  async createLabel(@Body() body: { name: string; color?: string }) {
    const { name, color } = body;
    if (!name) {
      throw new BadRequestException('Label name is required');
    }

    return this.imageService.createLabel(name, color);
  }

  // Delete label (removes from all images) - MUST BE BEFORE :id routes
  @Delete('labels/:labelId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteLabel(@Param('labelId') labelId: string) {
    await this.imageService.deleteLabel(labelId);
    return;
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
      labels: image.labels || [],
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

  // Add label to image
  @Post(':id/labels')
  @UseGuards(JwtAuthGuard)
  async addLabelToImage(
    @Param('id') imageId: string,
    @Body() body: { name: string; color?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const image = await this.imageService.getImage(imageId);

    if (!image || image.userId !== userId) {
      throw new BadRequestException('Image not found or access denied');
    }

    const { name, color } = body;
    if (!name) {
      throw new BadRequestException('Label name is required');
    }

    const updatedImage = await this.imageService.addLabelToImage(
      imageId,
      name,
      color,
    );

    return {
      id: updatedImage.id,
      labels: updatedImage.labels,
    };
  }

  // Remove label from image
  @Delete(':id/labels/:labelId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async removeLabelFromImage(
    @Param('id') imageId: string,
    @Param('labelId') labelId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    const image = await this.imageService.getImage(imageId);

    if (!image || image.userId !== userId) {
      throw new BadRequestException('Image not found or access denied');
    }

    const updatedImage = await this.imageService.removeLabelFromImage(
      imageId,
      labelId,
    );

    return {
      id: updatedImage.id,
      labels: updatedImage.labels,
    };
  }
}
