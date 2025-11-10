import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories-section',
  imports: [RouterLink],
  templateUrl: './categories-section.html',
  styleUrl: './categories-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesSection {
  categories = signal([
    { id: 1, name: 'التصميم', imageUrl: '/images/design.svg' },
    { id: 1, name: 'العلوم والتكنولوجيا', imageUrl: '/images/science.svg' },
    { id: 1, name: 'التسويق', imageUrl: '/images/marketing.svg' },
    { id: 1, name: 'إدارة أعمال', imageUrl: '/images/business.svg' },
    { id: 1, name: 'سينما', imageUrl: '/images/cinema.svg' },
    { id: 1, name: 'اللغات', imageUrl: '/images/language.svg' },
  ]);
}
