import { Routes } from '@angular/router';
import { Auth } from './auth';
import { resetPasswordGuard } from '@guards/reset-password-guard';

const routes: Routes = [
  {
    path: '',
    component: Auth,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        title: 'تسجيل الدخول',
        loadComponent: () => import('./login/login').then((c) => c.Login),
      },
      {
        path: 'signup',
        title: 'تسجيل حساب',
        loadComponent: () => import('./signup/signup').then((c) => c.Signup),
      },
      {
        path: 'forget-password',
        title: 'نسيت كلمه المرور',
        loadComponent: () =>
          import('./forget-password/forget-password').then((c) => c.ForgetPassword),
      },
      {
        path: 'reset-password',
        title: 'اعاده ضبط كلمه المرور',
        loadComponent: () => import('./reset-password/reset-password').then((c) => c.ResetPassword),
        canMatch: [resetPasswordGuard],
      },
    ],
  },
];

export default routes;
