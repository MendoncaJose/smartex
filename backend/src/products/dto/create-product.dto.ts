import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999999.99)
  @Type(() => Number)
  price: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'Product must have at least one category' })
  @ArrayMaxSize(20, { message: 'Product cannot have more than 20 categories' })
  @IsNumber({}, { each: true })
  categoryIds: number[];
}
