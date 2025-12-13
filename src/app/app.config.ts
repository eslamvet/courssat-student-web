import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { customHttpInterceptorInterceptor } from './interceptors/custom-http-interceptor-interceptor';
import { appInitializerFn } from '@utils/helpers';
import { CourssatTitleStrategy } from '@services/courssat-title-strategy';
import { provideNgxStripe } from 'ngx-stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(appInitializerFn),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([customHttpInterceptorInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    { provide: TitleStrategy, useClass: CourssatTitleStrategy },
    provideNgxStripe(),
  ],
};
