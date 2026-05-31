import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: FilterProductDto, @CurrentUser() user: JwtUser) {
    return this.productsService.findAll(user.id, filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.productsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() productData: CreateProductDto, @CurrentUser() user: JwtUser) {
    return this.productsService.create(productData, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: UpdateProductDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.productsService.update(id, productData, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.productsService.remove(id, user.id);
  }
}
