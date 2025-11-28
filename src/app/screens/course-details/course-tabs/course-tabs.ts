import { ChangeDetectionStrategy, Component, model } from '@angular/core';

@Component({
  selector: 'app-course-tabs',
  imports: [],
  templateUrl: './course-tabs.html',
  styleUrl: './course-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTabs {
  activeTap = model.required();
}
