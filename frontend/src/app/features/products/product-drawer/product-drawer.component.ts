import { Component, inject, signal, effect, input, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductsService } from '../../../core/services/products.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-drawer',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-drawer.component.html',
  styleUrl: './product-drawer.component.scss',
})
export class ProductDrawerComponent {
  private readonly productsService = inject(ProductsService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly product = input<Product | null>(null);
  readonly categories = input<Category[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryIds: this.fb.control<number[]>([], {
      validators: [(c: AbstractControl) => (c.value?.length ? null : { required: true })],
    }),
  });

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.form.patchValue({
          title: p.title,
          description: p.description ?? '',
          price: p.price,
          categoryIds: p.categories.map((c) => c.id),
        });
      } else {
        this.form.reset({ title: '', description: '', price: 0, categoryIds: [] });
      }
      this.form.markAsUntouched();
      this.form.markAsPristine();
    });
  }

  get isEdit(): boolean {
    return this.product() !== null;
  }

  cancel(): void {
    if (this.form.dirty && !confirm('Discard unsaved changes?')) return;
    this.cancelled.emit();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { title, description, price, categoryIds } = this.form.getRawValue();
    this.loading.set(true);

    const payload = {
      title: title!,
      description: description || undefined,
      price: Number(price),
      categoryIds: categoryIds!,
    };

    const obs = this.isEdit
      ? this.productsService.update(this.product()!.id, payload)
      : this.productsService.create(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Product updated' : 'Product created');
        this.loading.set(false);
        this.form.reset({ title: '', description: '', price: 0, categoryIds: [] });
        this.form.markAsUntouched();
        this.form.markAsPristine();
        this.saved.emit();
      },
      error: () => {
        this.toast.error(this.isEdit ? 'Failed to update product' : 'Failed to create product');
        this.loading.set(false);
      },
    });
  }
}
