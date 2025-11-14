import { Component } from '@angular/core';
import { CourseOverview } from './course-overview/course-overview';
import { CourseReviews } from './course-reviews/course-reviews';
import { CourseContent } from './course-content/course-content';

@Component({
  selector: 'app-course-details',
  imports: [CourseOverview, CourseReviews, CourseContent],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  activeTap: 'overview' | 'content' | 'reviews' = 'overview';
}
