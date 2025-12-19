import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@services/toast-service';
import { catchError, EMPTY, NEVER, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export const customHttpInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);
  const url = req.url.startsWith('/api') ? environment.baseUrl + req.url : req.url;
  const modifiedReq = req.clone({
    url,
    setHeaders: {
      ...(url.includes(environment.baseUrl) && {
        Authorization: `bearer ${localStorage.getItem('courssat-user-token') || ''}`,
      }),
    },
  });
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        toastService.addToast({
          id: Date.now(),
          type: 'error',
          title: 'حدث خطا ما',
          message: 'يرجي التحقق من اتصالك بالانترنت',
        });
        return NEVER;
      }
      if (error.status === 401) {
        toastService.addToast({
          id: Date.now(),
          type: 'info',
          title: 'يرجي تسجيل الدخول مجددا',
        });
        router.navigate(['auth', 'login'], { replaceUrl: true });
        return NEVER;
      }
      return throwError(() => new Error(error.error?.message ?? error.message));
    })
  );
};
