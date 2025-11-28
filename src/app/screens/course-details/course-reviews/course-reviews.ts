import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListApi } from '@models/Api';
import { CourseReview } from '@models/course';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { filter, finalize, fromEvent, iif, of, retry, startWith, switchMap } from 'rxjs';

type ReviewForm = {
  isLike: FormControl<boolean>;
  evaluationComment: FormControl<string>;
};

@Component({
  selector: 'app-course-reviews',
  imports: [ReactiveFormsModule],
  templateUrl: './course-reviews.html',
  styleUrl: './course-reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseReviews implements OnInit {
  customReviews = input<CourseReview[]>();
  courseId = input.required<number>();
  reviewsResSignal = signal<Partial<ListApi<CourseReview | { id: number }>>>({});
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
    iif(
      () => !!this.customReviews(),
      of({ list: this.customReviews() as CourseReview[] }),
      fromEvent(document.getElementById('course-reviews-wrapper')!, 'scroll').pipe(
        startWith('skip filtering stream'),
        filter(
          (ev: any) =>
            ev === 'skip filtering stream' ||
            !!(
              ev.target.scrollTop + ev.target.clientHeight >= ev.target.scrollHeight - 1 &&
              this.reviewsResSignal() &&
              this.reviewsResSignal().list!.length < this.reviewsResSignal().pagination!.total_count
            )
        ),
        switchMap(() =>
          this.courseService
            .getCourseReviews(this.courseId(), (this.reviewsResSignal()?.list?.length ?? 0) + 10)
            .pipe(
              startWith({
                list: Array.from({ length: 10 }, (_, index) => ({
                  id: (this.reviewsResSignal()?.list?.length ?? 0) + index,
                })),
              }),
              retry(1)
            )
        )
      )
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (
            !this.reviewsResSignal() ||
            (this.reviewsResSignal() && Object.hasOwn(data, 'pagination'))
          ) {
            this.reviewsResSignal.set(data);
          } else
            this.reviewsResSignal.update((r) => ({
              ...r,
              list: r.list ? [...r.list, ...data.list] : data.list,
            }));
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
              this.reviewsResSignal.update((r) => ({
                ...r,
                list: r.list ? [newReview, ...r.list] : [newReview],
              }));
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
