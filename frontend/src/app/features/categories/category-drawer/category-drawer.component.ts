import { Component, inject, signal, effect, input, output, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../../../core/services/categories.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-drawer',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './category-drawer.component.html',
  styleUrl: './category-drawer.component.scss',
})
export class CategoryDrawerComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly category = input<Category | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    effect(() => {
      const selectedCategory = this.category();
      untracked(() => {
        this.form.reset({ name: selectedCategory?.name ?? '' });
        this.form.markAsUntouched();
        this.form.markAsPristine();
      });
    });
  }

  get isEdit(): boolean {
    return this.category() !== null;
  }

  cancel(): void {
    if (this.form.dirty && !confirm('Discard unsaved changes?')) return;
    this.cancelled.emit();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name } = this.form.getRawValue();
    this.loading.set(true);

    const obs = this.isEdit
      ? this.categoriesService.update(this.category()!.id, { name: name! })
      : this.categoriesService.create({ name: name! });

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Category updated' : 'Category created');
        this.loading.set(false);
        this.form.reset({ name: '' });
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.saved.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error(
          error.status === 409
            ? 'Category already exists'
            : this.isEdit
              ? 'Failed to update category'
              : 'Failed to create category',
        );
        this.loading.set(false);
      },
    });
  }
}
