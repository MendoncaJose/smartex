import {
  BadRequestException,
  ConflictException,
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

    const productsQuery = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.userId = :userId', { userId })
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      productsQuery.andWhere('LOWER(product.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      productsQuery.andWhere('category.id = :categoryId', { categoryId });
    }

    const [products, totalProducts] = await productsQuery.getManyAndCount();

    return {
      data: products,
      total: totalProducts,
      page,
      limit,
      totalPages: Math.ceil(totalProducts / limit),
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

  async create(
    productData: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    await this.ensureTitleIsAvailable(productData.title, userId);

    const categories = await this.resolveCategories(
      productData.categoryIds,
      userId,
    );
    const product = this.productsRepository.create({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      userId,
      categories,
    });
    const savedProduct = await this.saveProduct(product);
    this.logger.log(`Product created id=${savedProduct.id} userId=${userId}`);
    return savedProduct;
  }

  async update(
    id: number,
    productData: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id, userId);

    if (
      productData.title !== undefined &&
      productData.title !== product.title
    ) {
      await this.ensureTitleIsAvailable(productData.title, userId, id);
      product.title = productData.title;
    }
    if (productData.description !== undefined) {
      product.description = productData.description;
    }
    if (productData.price !== undefined) product.price = productData.price;

    if (productData.categoryIds !== undefined) {
      product.categories = await this.resolveCategories(
        productData.categoryIds,
        userId,
      );
    }

    const savedProduct = await this.saveProduct(product);
    this.logger.log(`Product updated id=${savedProduct.id} userId=${userId}`);
    return savedProduct;
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

  private async ensureTitleIsAvailable(
    title: string,
    userId: number,
    currentProductId?: number,
  ): Promise<void> {
    const existingProduct = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.userId = :userId', { userId })
      .andWhere('LOWER(product.title) = LOWER(:title)', { title })
      .getOne();

    if (existingProduct && existingProduct.id !== currentProductId) {
      throw new ConflictException('Product already exists');
    }
  }

  private async saveProduct(product: Product): Promise<Product> {
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Product already exists');
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
