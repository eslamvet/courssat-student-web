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
        loadComponent: () => import('./my-courses/my-courses').then((c) => c.MyCourses),
      },
      {
        path: 'certificates',
        loadComponent: () =>
          import('./my-certificates/my-certificates').then((c) => c.MyCertificates),
      },
      {
        path: 'personal-info',
        loadComponent: () => import('./personal-info/personal-info').then((c) => c.PersonalInfo),
      },
      {
        path: 'fav-courses',
        loadComponent: () => import('./fav-courses/fav-courses').then((c) => c.FavCourses),
      },
    ],
  },
];

export default routes;
