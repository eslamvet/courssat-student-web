import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { UserService } from '@services/user-service';

export const authGuard: CanMatchFn = (route, segments) => {
  const userService = inject(UserService);
  const router = inject(Router);
  return !!userService.user() ? true : router.parseUrl('/auth/login');
};
