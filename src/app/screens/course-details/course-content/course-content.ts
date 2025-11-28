import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CourseTopic } from '@models/course';
import { UserService } from '@services/user-service';

@Component({
  selector: 'app-course-content',
  imports: [],
  templateUrl: './course-content.html',
  styleUrl: './course-content.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseContent {
  user = inject(UserService).user;
  topics = input.required<CourseTopic[]>();
  isPaid = input.required<boolean>();
  instructorId = input.required<string>();
  setActiveLesson = output<number>();
}
