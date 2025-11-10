import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-instructor-section',
  imports: [],
  templateUrl: './instructor-section.html',
  styleUrl: './instructor-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorSection {
  constructor() {
    fromEvent(window, 'resize').subscribe(console.log);
  }
}
