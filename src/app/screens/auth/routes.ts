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
        loadComponent: () => import('./login/login').then((c) => c.Login),
      },
      {
        path: 'signup',
        loadComponent: () => import('./signup/signup').then((c) => c.Signup),
      },
      {
        path: 'forget-password',
        loadComponent: () =>
          import('./forget-password/forget-password').then((c) => c.ForgetPassword),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password').then((c) => c.ResetPassword),
        canMatch: [resetPasswordGuard],
      },
    ],
  },
];

export default routes;
