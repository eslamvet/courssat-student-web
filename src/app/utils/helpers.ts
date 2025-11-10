import { inject } from '@angular/core';
import { CurrencyService } from '@services/currency-service';
import { UserService } from '@services/user-service';
import { catchError, EMPTY, forkJoin, map } from 'rxjs';

export const appInitializerFn = () => {
  const userService = inject(UserService);
  const currencyService = inject(CurrencyService);
  const userCountry = getUserCountry();
  return forkJoin([
    userService.getUserProfile(JSON.parse(localStorage.getItem('courssat-user') ?? 'null')?.id),
    currencyService.getCurrencyApi(userCountry),
  ]).pipe(
    map(([user, currency]) => {
      user && userService.setUser(user);
      currency &&
        currencyService.setCurrency({
          code: userCountry == 'EG' ? '\u0020' + 'ج.م' : '\u200F' + '\u0020' + '\uE900',
          value: currency.usd[userCountry == 'EG' ? 'egp' : 'sar'],
        });
      return 'done';
    }),
    catchError(() => EMPTY)
  );
};

export const getUserCountry = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timezone == 'Africa/Cairo' ? 'EG' : timezone == 'Asia/Riyadh' ? 'SA' : 'Other';
};
