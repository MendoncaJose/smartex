import {
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
    const category = this.categoriesRepository.create({
      ...categoryData,
      userId,
    });
    const savedCategory = await this.categoriesRepository.save(category);
    this.logger.log(`Category created id=${savedCategory.id} userId=${userId}`);
    return savedCategory;
  }

  async update(
    id: number,
    categoryData: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);
    Object.assign(category, categoryData);
    const savedCategory = await this.categoriesRepository.save(category);
    this.logger.log(`Category updated id=${savedCategory.id} userId=${userId}`);
    return savedCategory;
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoriesRepository.remove(category);
    this.logger.log(`Category deleted id=${id} userId=${userId}`);
  }
}
