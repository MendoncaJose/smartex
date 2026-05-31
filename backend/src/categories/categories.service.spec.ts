import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const mockCategory = { id: 1, name: 'Electronics', userId: 1 };

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return categories for the authenticated user', async () => {
      mockRepo.find.mockResolvedValue([mockCategory]);

      const result = await service.findAll(1);

      expect(result).toEqual([mockCategory]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { name: 'ASC' },
      });
    });

    it('should return empty array when user has no categories', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category that belongs to the user', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when category belongs to another user', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockCategory, userId: 2 });

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      mockRepo.create.mockReturnValue(mockCategory);
      mockRepo.save.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Electronics' }, 1);

      expect(result).toEqual(mockCategory);
      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Electronics',
        userId: 1,
      });
    });

    it('should associate category with the authenticated user', async () => {
      mockRepo.create.mockReturnValue({ name: 'Books', userId: 5 });
      mockRepo.save.mockResolvedValue({ id: 2, name: 'Books', userId: 5 });

      await service.create({ name: 'Books' }, 5);

      expect(mockRepo.create).toHaveBeenCalledWith({
        name: 'Books',
        userId: 5,
      });
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockCategory });
      mockRepo.save.mockResolvedValue({ ...mockCategory, name: 'Updated' });

      const result = await service.update(1, { name: 'Updated' }, 1);

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { name: 'X' }, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when updating another user category', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockCategory, userId: 2 });

      await expect(service.update(1, { name: 'X' }, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockRepo.findOne.mockResolvedValue(mockCategory);
      mockRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.not.toThrow();
      expect(mockRepo.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException when removing non-existent category', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
