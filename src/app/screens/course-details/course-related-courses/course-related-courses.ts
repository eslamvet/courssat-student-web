import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CourseCard } from '@components/course-card/course-card';
import { Course } from '@models/course';

@Component({
  selector: 'app-course-related-courses',
  imports: [CourseCard],
  templateUrl: './course-related-courses.html',
  styleUrl: './course-related-courses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseRelatedCourses {
  courses = input.required<Course[]>();
}
