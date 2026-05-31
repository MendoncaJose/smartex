import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: number, filters: FilterProductDto) {
    const { page = 1, limit = 24, search, categoryId } = filters;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.userId = :userId', { userId })
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere('LOWER(product.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { categories: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException();
    return product;
  }

  async create(dto: CreateProductDto, userId: number): Promise<Product> {
    const categories = await this.resolveCategories(dto.categoryIds, userId);
    const product = this.productsRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      userId,
      categories,
    });
    const saved = await this.productsRepository.save(product);
    this.logger.log(`Product created id=${saved.id} userId=${userId}`);
    return saved;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id, userId);

    if (dto.title !== undefined) product.title = dto.title;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;

    if (dto.categoryIds !== undefined) {
      product.categories = await this.resolveCategories(
        dto.categoryIds,
        userId,
      );
    }

    const saved = await this.productsRepository.save(product);
    this.logger.log(`Product updated id=${saved.id} userId=${userId}`);
    return saved;
  }

  async remove(id: number, userId: number): Promise<void> {
    const product = await this.findOne(id, userId);
    await this.productsRepository.remove(product);
    this.logger.log(`Product deleted id=${id} userId=${userId}`);
  }

  private async resolveCategories(
    categoryIds: number[],
    userId: number,
  ): Promise<Category[]> {
    const uniqueCategoryIds = [...new Set(categoryIds)];
    const categories = await this.categoriesRepository.findBy({
      id: In(uniqueCategoryIds),
    });
    const categoriesById = new Map(
      categories.map((category) => [category.id, category]),
    );

    const missing = uniqueCategoryIds.filter((id) => !categoriesById.has(id));
    if (missing.length) {
      throw new NotFoundException(
        `Categories not found: ${missing.join(', ')}`,
      );
    }

    const forbidden = categories.filter(
      (category) => category.userId !== userId,
    );
    if (forbidden.length) {
      throw new BadRequestException(
        'One or more categories do not belong to you',
      );
    }

    return categoryIds.map((id) => categoriesById.get(id)!);
  }
}
