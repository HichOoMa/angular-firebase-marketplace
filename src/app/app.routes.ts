import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'browse',
    loadComponent: () => import('./pages/browse/browse.component').then(m => m.BrowseComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent)
  },
  {
    path: 'add-product',
    loadComponent: () => import('./pages/add-product/add-product.component').then(m => m.AddProductComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  // Profile and Admin routes would be implemented in a real application
  {
    path: '**',
    redirectTo: ''
  }
];
