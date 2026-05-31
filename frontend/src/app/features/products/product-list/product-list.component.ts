import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductDrawerComponent } from '../product-drawer/product-drawer.component';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-list',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSidenavModule,
    ProductCardComponent,
    ProductDrawerComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);

  readonly page = signal(0);
  readonly limit = signal(24);
  readonly pageSizeOptions = [12, 24, 48];
  readonly skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  readonly searchControl = new FormControl('');
  readonly categoryControl = new FormControl<number | null>(null);

  readonly drawerOpen = signal(false);
  readonly editingProduct = signal<Product | null>(null);

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => {
        this.page.set(0);
        this.loadProducts();
      });

    this.categoryControl.valueChanges.subscribe(() => {
      this.page.set(0);
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading.set(true);
    const search = this.searchControl.value ?? '';
    const categoryId = this.categoryControl.value ?? undefined;

    this.productsService
      .getAll({
        page: this.page() + 1,
        limit: this.limit(),
        search: search || undefined,
        categoryId,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load products');
          this.loading.set(false);
        },
      });
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  onPageChange(event: PageEvent) {
    this.page.set(event.pageIndex);
    this.limit.set(event.pageSize);
    this.loadProducts();
  }

  openCreate() {
    this.editingProduct.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(product: Product) {
    this.editingProduct.set(product);
    this.drawerOpen.set(true);
  }

  onSaved() {
    this.drawerOpen.set(false);
    this.loadProducts();
  }

  confirmDelete(product: Product) {
    const ref = this.dialog.open(DeleteDialogComponent, {
      data: { title: `Delete "${product.title}"?`, message: 'This cannot be undone.' },
      width: '360px',
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.productsService.delete(product.id).subscribe({
        next: () => {
          this.toast.success('Product deleted');
          this.loadProducts();
        },
        error: () => this.toast.error('Failed to delete product'),
      });
    });
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue(null);
  }
}
