import { Category } from './category.model';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  userId: number;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
