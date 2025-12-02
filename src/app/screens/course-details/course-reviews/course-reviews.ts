import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListApi, MakeOptional } from '@models/Api';
import { CourseReview } from '@models/course';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { debounceTime, filter, finalize, fromEvent } from 'rxjs';

type ReviewForm = {
  isLike: FormControl<boolean>;
  evaluationComment: FormControl<string>;
};

@Component({
  selector: 'app-course-reviews',
  imports: [ReactiveFormsModule, DatePipe, ImgUrlPipe],
  templateUrl: './course-reviews.html',
  styleUrl: './course-reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviews implements OnInit {
  courseReviewsRes = input.required<
    MakeOptional<ListApi<Partial<CourseReview>>, 'pagination'> & { custom?: boolean }
  >();
  courseId = input.required<number>();
  isPaid = input.required<boolean>();
  loading = signal(false);
  loadReviews = output<CourseReview | void>();
  courseService = inject(CourseService);
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastService);
  user = inject(UserService).user();
  reviewForm = new FormGroup<ReviewForm>({
    isLike: new FormControl(true, { nonNullable: true }),
    evaluationComment: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    if (!this.courseReviewsRes().custom) {
      this.courseReviewsRes().list.every((r) => !r.courseId) && this.loadReviews.emit();
      fromEvent(document.getElementById('course-reviews-wrapper')!, 'scroll')
        .pipe(
          debounceTime(500),
          filter((ev: any) => {
            const courseReviewResPagination = this.courseReviewsRes().pagination;
            return !!(
              courseReviewResPagination &&
              this.courseReviewsRes().list.every((r) => r.courseId) &&
              this.courseReviewsRes().list.length < courseReviewResPagination.total_count &&
              ev.target.scrollTop + ev.target.clientHeight >= ev.target.scrollHeight - 1
            );
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: () => {
            this.loadReviews.emit();
          },
        });
    }
  }

  get isLikeReviewFormControl() {
    return this.reviewForm.get('isLike');
  }

  addCourseReviewHandler() {
    if (!this.loading()) {
      if (this.reviewForm.valid) {
        this.loading.set(true);
        const reviewData = {
          id: 0,
          ...this.reviewForm.getRawValue(),
          userId: this.user?.id,
          courseId: this.courseId(),
        };
        this.courseService
          .addCourseReview(reviewData)
          .pipe(finalize(() => this.loading.set(false)))
          .subscribe({
            next: () => {
              const newReview = {
                ...reviewData,
                date: new Date().toISOString(),
                firstName: this.user?.firstName!,
                familyName: this.user?.familyName!,
                imageURL: this.user?.imageURL!,
              };
              this.loadReviews.emit(newReview);
              this.toastService.addToast({
                id: Date.now(),
                type: 'success',
                title: 'تم اضافة التقييم بنجاح',
              });
            },
            error: (error) => {
              this.toastService.addToast({
                id: Date.now(),
                type: 'error',
                title: 'حدث خطا ما',
                message: error.message,
              });
            },
          });
      } else this.reviewForm.markAllAsTouched();
    }
  }
}
