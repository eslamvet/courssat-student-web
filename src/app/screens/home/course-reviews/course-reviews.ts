import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReviewService } from '@services/review-service';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-course-reviews',
  imports: [],
  templateUrl: './course-reviews.html',
  styleUrl: './course-reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReviewService],
})
export class CourseReviews {
  reviews = toSignal(
    inject(ReviewService)
      .getHomeReviews()
      .pipe(
        startWith(Array(6)),
        map((data) => data.slice(0, 6))
      )
  );
}
