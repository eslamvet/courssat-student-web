import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Package } from '@models/package';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CurrencyService } from '@services/currency-service';
import { UserCountry } from '@utils/constants';
import { getUserCountry } from '@utils/helpers';

@Component({
  selector: 'app-package-card',
  imports: [DecimalPipe, RouterLink, NgOptimizedImage, ImgUrlPipe],
  templateUrl: './package-card.html',
  styleUrl: './package-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageCard {
  currency = inject(CurrencyService).currency();
  packageInput = input.required<Package>();
  isSaudi = getUserCountry() === UserCountry.SA;
}
