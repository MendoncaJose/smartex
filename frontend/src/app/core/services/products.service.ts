import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse } from '../models/product.model';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/products`;

  getAll(filters: ProductFilters = {}) {
    let params = new HttpParams();
    if (filters.page) params = params.set('page', filters.page);
    if (filters.limit) params = params.set('limit', filters.limit);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    return this.http.get<ProductsResponse>(this.api, { params });
  }

  getOne(id: number) {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  create(data: { title: string; description?: string; price: number; categoryIds: number[] }) {
    return this.http.post<Product>(this.api, data);
  }

  update(id: number, data: Partial<{ title: string; description: string; price: number; categoryIds: number[] }>) {
    return this.http.patch<Product>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
