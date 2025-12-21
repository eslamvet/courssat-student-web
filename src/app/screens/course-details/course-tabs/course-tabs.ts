import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { CourseOverview } from '../course-overview/course-overview';
import { CourseContent } from '../course-content/course-content';
import { CourseReviews } from '../course-reviews/course-reviews';
import { courseDataVM, CourseReview, CourseTopic } from '@models/course';

@Component({
  selector: 'app-course-tabs',
  imports: [CourseOverview, CourseContent, CourseReviews],
  templateUrl: './course-tabs.html',
  styleUrl: './course-tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseTabs {
  courseTabs = [
    { label: 'تفاصيل الكورس', value: 'overview' },
    { label: 'محتوى الكورس', value: 'content' },
    { label: 'التقييمات', value: 'reviews' },
  ];
  activeTap = model.required();
  courseLoading = input.required<boolean>();
  courseDescription = input.required<string>();
  courseDataVMs = input.required<courseDataVM[]>();
  courseTopics = input.required<CourseTopic[]>();
  isPaid = input.required<boolean>();
  courseInstructorId = input.required<string>();
  courseId = input.required<number>();
  courseCustomReviews = input<CourseReview[]>();
  setActiveLesson = output<number>();
}
