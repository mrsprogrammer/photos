import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { ImageRepository } from './image.repository';
import { LabelRepository } from './label.repository';
import { S3Service } from './s3.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ImageService - Labels', () => {
  let service: ImageService;
  let imageRepository: jest.Mocked<ImageRepository>;
  let labelRepository: jest.Mocked<LabelRepository>;

  const mockImage = {
    id: 'image-123',
    userId: 'user-123',
    s3Key: 'test-key',
    filename: 'test.jpg',
    fileSize: 1024,
    contentType: 'image/jpeg',
    status: 'active',
    labels: [],
    uploadedAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLabel = {
    id: 'label-123',
    name: 'vacation',
    color: '#FF5733',
    images: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: ImageRepository,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: LabelRepository,
          useValue: {
            findOrCreate: jest.fn(),
            findByName: jest.fn(),
            getAllLabels: jest.fn(),
            deleteLabel: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    imageRepository = module.get(ImageRepository);
    labelRepository = module.get(LabelRepository);
  });

  describe('addLabelToImage', () => {
    it('should add a new label to an image', async () => {
      const image = { ...mockImage, labels: [] };
      imageRepository.findById.mockResolvedValue(image);
      labelRepository.findOrCreate.mockResolvedValue(mockLabel);
      imageRepository.save.mockResolvedValue({
        ...image,
        labels: [mockLabel],
      });

      const result = await service.addLabelToImage(
        'image-123',
        'vacation',
        '#FF5733',
      );

      expect(imageRepository.findById).toHaveBeenCalledWith('image-123');
      expect(labelRepository.findOrCreate).toHaveBeenCalledWith(
        'vacation',
        '#FF5733',
      );
      expect(result.labels).toHaveLength(1);
      expect(result.labels[0].name).toBe('vacation');
    });

    it('should throw NotFoundException when image does not exist', async () => {
      imageRepository.findById.mockResolvedValue(null);

      await expect(
        service.addLabelToImage('non-existent', 'vacation'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when label already exists on image', async () => {
      const image = { ...mockImage, labels: [mockLabel] };
      imageRepository.findById.mockResolvedValue(image);
      labelRepository.findOrCreate.mockResolvedValue(mockLabel);

      await expect(
        service.addLabelToImage('image-123', 'vacation'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeLabelFromImage', () => {
    it('should remove a label from an image', async () => {
      const image = { ...mockImage, labels: [mockLabel] };
      imageRepository.findById.mockResolvedValue(image);
      imageRepository.save.mockResolvedValue({ ...image, labels: [] });

      const result = await service.removeLabelFromImage(
        'image-123',
        'label-123',
      );

      expect(result.labels).toHaveLength(0);
    });

    it('should throw NotFoundException when image does not exist', async () => {
      imageRepository.findById.mockResolvedValue(null);

      await expect(
        service.removeLabelFromImage('non-existent', 'label-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when label is not on image', async () => {
      const image = { ...mockImage, labels: [] };
      imageRepository.findById.mockResolvedValue(image);

      await expect(
        service.removeLabelFromImage('image-123', 'label-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllLabels', () => {
    it('should return all labels', async () => {
      const labels = [
        mockLabel,
        { ...mockLabel, id: 'label-456', name: 'family' },
      ];
      labelRepository.getAllLabels.mockResolvedValue(labels);

      const result = await service.getAllLabels();

      expect(result).toEqual(labels);
      expect(labelRepository.getAllLabels).toHaveBeenCalled();
    });
  });

  describe('createLabel', () => {
    it('should create a new label', async () => {
      labelRepository.findByName.mockResolvedValue(null);
      labelRepository.findOrCreate.mockResolvedValue(mockLabel);

      const result = await service.createLabel('vacation', '#FF5733');

      expect(result).toEqual(mockLabel);
      expect(labelRepository.findByName).toHaveBeenCalledWith('vacation');
    });

    it('should throw BadRequestException when label already exists', async () => {
      labelRepository.findByName.mockResolvedValue(mockLabel);

      await expect(service.createLabel('vacation')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteLabel', () => {
    it('should delete a label', async () => {
      labelRepository.deleteLabel.mockResolvedValue(undefined);

      await service.deleteLabel('label-123');

      expect(labelRepository.deleteLabel).toHaveBeenCalledWith('label-123');
    });
  });
});
