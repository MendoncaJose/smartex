import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/categories`;

  getAll() {
    return this.http.get<Category[]>(this.api);
  }

  getOne(id: number) {
    return this.http.get<Category>(`${this.api}/${id}`);
  }

  create(data: { name: string }) {
    return this.http.post<Category>(this.api, data);
  }

  update(id: number, data: { name?: string }) {
    return this.http.patch<Category>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
