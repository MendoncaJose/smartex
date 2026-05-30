import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';

const mockCategory = { id: 1, name: 'Electronics', userId: 1 };
const mockProduct = {
  id: 1,
  title: 'iPhone 15',
  description: 'Test',
  price: 999,
  userId: 1,
  categories: [mockCategory],
};

const mockQueryBuilder: any = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
};

const mockProductRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockCategoryRepo = {
  findOne: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
    mockProductRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProduct], 1]);
  });

  describe('findAll', () => {
    it('should return paginated products for the user', async () => {
      const result = await service.findAll(1, { page: 1, limit: 24 });

      expect(result.data).toEqual([mockProduct]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply search filter when provided', async () => {
      await service.findAll(1, { search: 'iphone' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(product.title) LIKE LOWER(:search)',
        { search: '%iphone%' },
      );
    });

    it('should apply categoryId filter when provided', async () => {
      await service.findAll(1, { categoryId: 1 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'category.id = :categoryId',
        { categoryId: 1 },
      );
    });

    it('should calculate correct pagination metadata', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 48]);

      const result = await service.findAll(1, { page: 2, limit: 24 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(24);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a product that belongs to the user', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when product belongs to another user', async () => {
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct, userId: 2 });

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create and return a product with categories', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(mockCategory);
      mockProductRepo.create.mockReturnValue(mockProduct);
      mockProductRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create(
        { title: 'iPhone 15', price: 999, categoryIds: [1] },
        1,
      );

      expect(result).toEqual(mockProduct);
      expect(mockProductRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when a categoryId does not exist', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ title: 'Test', price: 10, categoryIds: [999] }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when category belongs to another user', async () => {
      mockCategoryRepo.findOne.mockResolvedValue({ ...mockCategory, userId: 2 });

      await expect(
        service.create({ title: 'Test', price: 10, categoryIds: [1] }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update title and price', async () => {
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct });
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, title: 'Updated', price: 799 });

      const result = await service.update(1, { title: 'Updated', price: 799 }, 1);

      expect(result.title).toBe('Updated');
      expect(result.price).toBe(799);
    });

    it('should update categories when categoryIds provided', async () => {
      const newCat = { id: 2, name: 'Computers', userId: 1 };
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct });
      mockCategoryRepo.findOne.mockResolvedValue(newCat);
      mockProductRepo.save.mockResolvedValue({ ...mockProduct, categories: [newCat] });

      const result = await service.update(1, { categoryIds: [2] }, 1);

      expect(result.categories).toEqual([newCat]);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.update(99, { title: 'X' }, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when updating another user product', async () => {
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct, userId: 2 });

      await expect(service.update(1, { title: 'X' }, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should not mutate fields that are not provided', async () => {
      const original = { ...mockProduct, description: 'original desc' };
      mockProductRepo.findOne.mockResolvedValue(original);
      mockProductRepo.save.mockImplementation(async (p) => p);

      const result = await service.update(1, { title: 'New title' }, 1);

      expect(result.description).toBe('original desc');
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockProductRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove(1, 1)).resolves.not.toThrow();
      expect(mockProductRepo.remove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when removing another user product', async () => {
      mockProductRepo.findOne.mockResolvedValue({ ...mockProduct, userId: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
