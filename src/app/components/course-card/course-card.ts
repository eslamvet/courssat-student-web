import { NgOptimizedImage, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Course } from '@models/course';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CurrencyService } from '@services/currency-service';
import { getUserCountry } from '@utils/helpers';
import { RouterLink } from '@angular/router';
import { UserCountry } from '@utils/constants';

@Component({
  selector: 'app-course-card',
  imports: [ImgUrlPipe, NgOptimizedImage, DecimalPipe, RouterLink],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseCard {
  currency = inject(CurrencyService).currency();
  courseInput = input.required<Course | null>({
    alias: 'course',
  });
  isPurchased = input(false);
  isSaudi = getUserCountry() === UserCountry.SA;
  isMobile = matchMedia('(width <= 640px)').matches;
}
