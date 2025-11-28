import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { courseDataVM } from '@models/course';

@Component({
  selector: 'app-course-overview',
  imports: [],
  templateUrl: './course-overview.html',
  styleUrl: './course-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseOverview {
  description = input.required();
  courseDataVMS = input.required<courseDataVM[]>();
}
