import { Routes } from '@angular/router';
import { Auth } from './auth';

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
    ],
  },
];

export default routes;
