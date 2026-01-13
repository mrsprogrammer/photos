export class SaveImageMetadataDto {
  s3Key: string;
  filename: string;
  fileSize?: number;
  contentType?: string;
}
