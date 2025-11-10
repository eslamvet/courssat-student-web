import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Package } from '@models/package';
import { CurrencyService } from '@services/currency-service';
import { getUserCountry } from '@utils/helpers';

@Component({
  selector: 'app-package-card',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './package-card.html',
  styleUrl: './package-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageCard {
  currency = inject(CurrencyService).currency();
  packageInput = input.required<Package>();
  isSaudi = getUserCountry() == 'SA';
}
