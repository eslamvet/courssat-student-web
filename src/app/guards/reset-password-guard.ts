import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

export const resetPasswordGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  return !!router.currentNavigation()?.initialUrl.queryParams['token']
    ? true
    : router.parseUrl('/auth/forget-password');
};
