import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  host: {
    class: 'bg-primary dark:bg-dark-primary',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
