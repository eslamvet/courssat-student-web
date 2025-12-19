import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseReview } from '@models/course';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { finalize } from 'rxjs';

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
  customCourseReviews = input<CourseReview[]>();
  courseId = input.required<number>();
  isPaid = input.required<boolean>();
  courseReviews = signal<CourseReview[]>([]);
  courseReviewsTotalPages = signal(5);
  loading = signal(false);
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
    if (this.customCourseReviews()) this.courseReviews.set(this.customCourseReviews()!);
    else this.getCourseReviews();
  }

  get isLikeReviewFormControl() {
    return this.reviewForm.get('isLike');
  }

  loadMoreReviews(ev: any) {
    !this.customCourseReviews() &&
      ev.target.scrollTop + ev.target.clientHeight >= ev.target.scrollHeight - 1 &&
      this.courseReviews().length < this.courseReviewsTotalPages() &&
      this.getCourseReviews(true);
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
              this.courseReviews.update((prev) => [newReview, ...prev]);
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

  getCourseReviews(loadMore = false) {
    if (this.courseReviews().find((c) => !c?.id)) return;
    if (loadMore) this.courseReviews.update((prev) => [...prev, ...Array(5)]);
    else {
      this.courseReviews.set(Array(5));
    }
    this.courseService.getCourseReviews(this.courseId(), this.courseReviews().length).subscribe({
      next: ({ list, pagination: { total_count } }) => {
        this.courseReviews.set(list);
        this.courseReviewsTotalPages.set(total_count!);
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
  }
}
