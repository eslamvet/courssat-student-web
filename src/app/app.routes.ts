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
    title: 'من نحن',
  },
  {
    path: 'course/:courseId',
    loadComponent: () =>
      import('./screens/course-details/course-details').then((c) => c.CourseDetails),
  },
  {
    path: 'category/:categoryId',
    loadComponent: () => import('./screens/category/category').then((c) => c.Category),
  },
  {
    path: 'package/:packageId',
    loadComponent: () => import('./screens/package/package').then((c) => c.PackageScreen),
  },
  {
    path: 'cart',
    loadComponent: () => import('./screens/cart/cart').then((c) => c.Cart),
    title: 'سله المشتريات',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./screens/checkout/checkout').then((c) => c.Checkout),
    title: 'اتمام الدفع',
  },
  {
    path: 'confirm-order',
    loadComponent: () =>
      import('./screens/confirm-order/confirm-order').then((c) => c.ConfirmOrder),
  },
];
