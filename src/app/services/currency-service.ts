import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Currency } from '@models/currency';
import { UserCountry } from '@utils/constants';
import { iif, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  http = inject(HttpClient);
  private currencySignal = signal<Currency>({
    code: '\u200F' + '$',
    value: 1,
  });

  readonly currency = this.currencySignal.asReadonly();

  getCurrencyApi(countryCode: typeof UserCountry.EG | typeof UserCountry.SA) {
    return iif(
      () => [UserCountry.EG, UserCountry.SA].includes(countryCode),
      this.http.get<{ date: string; usd: Record<string, number> }>(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      ),
      of(null)
    );
  }

  setCurrency(data: Currency) {
    this.currencySignal.set(data);
  }
}
