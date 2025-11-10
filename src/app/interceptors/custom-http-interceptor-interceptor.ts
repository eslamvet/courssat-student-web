import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const customHttpInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    url: req.url.startsWith('/api') ? environment.baseUrl + req.url : req.url,
    setHeaders: {},
  });
  return next(modifiedReq);
};
