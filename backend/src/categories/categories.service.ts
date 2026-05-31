import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId) throw new ForbiddenException();
    return category;
  }

  async create(
    categoryData: CreateCategoryDto,
    userId: number,
  ): Promise<Category> {
    await this.ensureNameIsAvailable(categoryData.name, userId);

    const category = this.categoriesRepository.create({
      ...categoryData,
      userId,
    });
    const savedCategory = await this.saveCategory(category);
    this.logger.log(`Category created id=${savedCategory.id} userId=${userId}`);
    return savedCategory;
  }

  async update(
    id: number,
    categoryData: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);
    if (
      categoryData.name !== undefined &&
      categoryData.name !== category.name
    ) {
      await this.ensureNameIsAvailable(categoryData.name, userId, id);
    }

    Object.assign(category, categoryData);
    const savedCategory = await this.saveCategory(category);
    this.logger.log(`Category updated id=${savedCategory.id} userId=${userId}`);
    return savedCategory;
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoriesRepository.remove(category);
    this.logger.log(`Category deleted id=${id} userId=${userId}`);
  }

  private async ensureNameIsAvailable(
    name: string,
    userId: number,
    currentCategoryId?: number,
  ): Promise<void> {
    const existingCategory = await this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('LOWER(category.name) = LOWER(:name)', { name })
      .getOne();

    if (existingCategory && existingCategory.id !== currentCategoryId) {
      throw new ConflictException('Category already exists');
    }
  }

  private async saveCategory(category: Category): Promise<Category> {
    try {
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category already exists');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
