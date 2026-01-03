import { Routes } from '@angular/router';
import { Profile } from './profile';

const routes: Routes = [
  {
    path: '',
    component: Profile,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'personal-info',
      },
      {
        path: 'courses',
        title: 'كورساتي',
        loadComponent: () => import('./my-courses/my-courses').then((c) => c.MyCourses),
      },
      {
        path: 'certificates',
        title: 'شهاداتي',
        loadComponent: () =>
          import('./my-certificates/my-certificates').then((c) => c.MyCertificates),
      },
      {
        path: 'personal-info',
        title: 'معلوماتي الشخصيه',
        loadComponent: () => import('./personal-info/personal-info').then((c) => c.PersonalInfo),
      },
      {
        path: 'fav-courses',
        title: 'كورساتي المفضله',
        loadComponent: () => import('./fav-courses/fav-courses').then((c) => c.FavCourses),
      },
      {
        path: 'support',
        title: 'الدعم الفني',
        loadComponent: () => import('./support/support').then((c) => c.Support),
      },
    ],
  },
];

export default routes;
