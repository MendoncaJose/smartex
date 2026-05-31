import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list.component').then(
            (m) => m.CategoryListComponent,
          ),
      },
      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'products' },
];
