import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { categories } from '@utils/constants';

@Component({
  selector: 'app-categories-section',
  imports: [RouterLink],
  templateUrl: './categories-section.html',
  styleUrl: './categories-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesSection {
  categories = signal(categories);
}
