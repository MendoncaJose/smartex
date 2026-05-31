import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { CategoriesService } from '../../../core/services/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { CategoryDrawerComponent } from '../category-drawer/category-drawer.component';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatSidenavModule,
    CategoryDrawerComponent,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  readonly searchControl = new FormControl('');
  readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => value ?? ''),
      debounceTime(250),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return term
      ? this.categories().filter((category) =>
          category.name.toLowerCase().includes(term),
        )
      : this.categories();
  });

  readonly columns = ['name', 'createdAt', 'actions'];

  readonly drawerOpen = signal(false);
  readonly editingCategory = signal<Category | null>(null);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  openCreate() {
    this.editingCategory.set(null);
    this.drawerOpen.set(true);
  }

  openEdit(category: Category) {
    this.editingCategory.set(category);
    this.drawerOpen.set(true);
  }

  onSaved() {
    this.drawerOpen.set(false);
    this.loadCategories();
  }

  confirmDelete(category: Category) {
    const ref = this.dialog.open(DeleteDialogComponent, {
      data: { title: `Delete "${category.name}"?`, message: 'This cannot be undone.' },
      width: '360px',
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.categoriesService.delete(category.id).subscribe({
        next: () => {
          this.toast.success('Category deleted');
          this.loadCategories();
        },
        error: () => this.toast.error('Failed to delete category'),
      });
    });
  }
}
