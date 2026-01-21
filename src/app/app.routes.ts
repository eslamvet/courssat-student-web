import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth-guard';
import { unAuthGuard } from '@guards/un-auth-guard';

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
    canMatch: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () => import('./screens/checkout/checkout').then((c) => c.Checkout),
    title: 'اتمام الدفع',
  },
  {
    path: 'confirm-order',
    title: 'تاكيد عمليه الدفع',
    loadComponent: () =>
      import('./screens/confirm-order/confirm-order').then((c) => c.ConfirmOrder),
  },
  {
    path: 'terms',
    title: 'الشروط و الاحكام',
    loadComponent: () =>
      import('./screens/terms-and-conditions/terms-and-conditions').then(
        (c) => c.TermsAndConditions
      ),
  },
  {
    path: 'privacy-policy',
    title: 'سياسه الخصوصيه',
    loadComponent: () =>
      import('./screens/privacy-policy/privacy-policy').then((c) => c.PrivacyPolicy),
  },
  {
    path: 'auth',
    loadChildren: () => import('./screens/auth/routes'),
    canMatch: [unAuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () => import('./screens/profile/routes'),
    canMatch: [authGuard],
  },
  {
    path: 'all-packages',
    loadComponent: () =>
      import('./screens/packages-list/packages-list').then((c) => c.PackagesList),
    title: 'جميع الباقات',
  },
  {
    path: 'resetpassword',
    redirectTo: (route) => {
      const params = new URLSearchParams(route.queryParams);
      return `/auth/reset-password?${params.toString()}`;
    },
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./screens/not-found/not-found').then((c) => c.NotFound),
  },
];
