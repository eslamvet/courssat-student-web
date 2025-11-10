import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourseCard } from '@components/course-card/course-card';
import { Course } from '@models/course';

@Component({
  selector: 'app-new-courses-section',
  imports: [CourseCard],
  templateUrl: './new-courses-section.html',
  styleUrl: './new-courses-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewCoursesSection {
  courses = input.required<Course[]>();
}
