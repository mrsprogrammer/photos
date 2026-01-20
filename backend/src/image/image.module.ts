import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { ImageRepository } from './image.repository';
import { LabelRepository } from './label.repository';
import { S3Service } from './s3.service';
import { Image } from './image.entity';
import { Label } from './label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image, Label])],
  providers: [ImageService, ImageRepository, LabelRepository, S3Service],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
