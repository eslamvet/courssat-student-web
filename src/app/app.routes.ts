import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./screens/home/home').then((c) => c.Home),
  },
  {
    path: 'about-us',
    loadComponent: () => import('./screens/about-us/about-us').then((c) => c.AboutUs),
  },
  {
    path: 'cart',
    loadComponent: () => import('./screens/cart/cart').then((c) => c.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./screens/checkout/checkout').then((c) => c.Checkout),
  },
];
