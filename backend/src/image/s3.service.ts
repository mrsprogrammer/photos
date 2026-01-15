import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client;
  private bucket: string;

  constructor() {
    const region =
      process.env.AWS_REGION ||
      process.env.AWS_DEFAULT_REGION ||
      'eu-central-1';
    this.bucket = process.env.S3_BUCKET || '';
    this.client = new S3Client({ region });
    this.logger.log(
      `S3Service initialized region=${region} bucket=${this.bucket ? 'configured' : 'not-configured'}`,
    );
  }

  hasBucket(): boolean {
    return !!this.bucket;
  }

  async getPresignedPutUrl(
    key: string,
    contentType: string,
    expiresSeconds = 900,
  ) {
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.client, cmd, {
      expiresIn: expiresSeconds,
    });
    return url;
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await this.client.send(cmd);
    return key;
  }

  async getPresignedGetUrl(key: string, expiresSeconds = 3600) {
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.client, cmd, {
      expiresIn: expiresSeconds,
    });
    return url;
  }
}
