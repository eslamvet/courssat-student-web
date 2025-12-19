import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { CourseKeyword } from '@models/course';
import { CurrencyService } from '@services/currency-service';
import { UserService } from '@services/user-service';
import { getUserCountry } from '@utils/helpers';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { Coupon } from '@models/coupon';
import { ToastService } from '@services/toast-service';
import { CartService } from '@services/cart-service';
import { CouponService } from '@services/coupon-service';
import { User } from '@models/user';
import { Router } from '@angular/router';
import { CourseService } from '@services/course-service';

@Component({
  selector: 'app-course-sidebar',
  imports: [DecimalPipe, ReactiveFormsModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CouponService],
})
export class CourseSidebar {
  user = inject(UserService).user;
  router = inject(Router);
  currency = inject(CurrencyService).currency();
  couponService = inject(CouponService);
  courseService = inject(CourseService);
  toastService = inject(ToastService);
  cart = inject(CartService).cart;
  discountPrice = input.required<number>();
  originalPrice = input.required<number>();
  hourCount = input.required<number>();
  courseLoading = input.required<boolean>();
  lessonCount = input.required<number>();
  studentsCount = input.required<number>();
  instructorBrief = input();
  coupon = input<Coupon>();
  courseId = input.required<number>();
  courseName = input.required<string>();
  courseImg = input.required<string>();
  courseRedirectUrl = input<string>();
  coursePaymentLabel = input<string>();
  instructorName = input.required();
  keywords = input.required<CourseKeyword[]>();
  isPaid = input.required<boolean>();
  instructorId = input.required<string>();
  isSaudi = getUserCountry() == 'SA';
  addToCart = output<void>();
  applyCoupon = output<Coupon | null>();
  changePrice = output<number>();
  couponCode = new FormControl('', { nonNullable: true });
  customPrice = new FormControl('', { nonNullable: true });
  currentLoading = signal<'apply-coupon' | 'apply-min-price' | null>(null);

  applyCouponHandler() {
    if (this.coupon()) {
      this.applyCoupon.emit(null);
      return;
    }
    if (!this.currentLoading() && this.couponCode.value) {
      this.currentLoading.set('apply-coupon');
      this.couponService
        .applyCoupon(this.couponCode.value, this.courseId())
        .pipe(
          switchMap((coupon) =>
            this.couponService
              .saveCoupon({
                student_email: (this.user() as User).email,
                student_name: (this.user() as User).firstName,
                code: this.couponCode.value,
                course_id: this.courseId().toString(),
                course_name: this.courseName(),
              })
              .pipe(
                map(() => coupon),
                catchError(() => of(coupon))
              )
          ),
          catchError(() => this.couponService.applyCoupon(this.couponCode.value))
        )
        .subscribe({
          next: (coupon) => {
            this.currentLoading.set(null);
            if (coupon.courseId === null && coupon.id == this.cart().coupon?.id) {
              this.toastService.addToast({
                id: Date.now(),
                type: 'info',
                title: 'تنبيه',
                message: 'الكوبون مستخدم بالفعل فى السله',
              });
            } else if (
              this.cart().coupon?.id &&
              this.cart().items.find((c) => c.id == this.courseId())
            ) {
              this.toastService.addToast({
                id: Date.now(),
                type: 'info',
                title: 'تنبيه',
                message: 'الكورس موجود فى السله وعليه كوبون بالفعل',
              });
            } else {
              this.applyCoupon.emit(coupon);
            }
          },
          error: (error) => {
            this.currentLoading.set(null);
            this.toastService.addToast({
              id: Date.now(),
              type: 'error',
              title: 'حدث خطا ما',
              message:
                error.message === 'This Copon is expired or not suitable with this course'
                  ? 'الكوبون غير صالح'
                  : error.message,
            });
          },
        });
    }
  }

  purchaseCourseHandler() {
    if (this.courseRedirectUrl()) {
      window.open(this.courseRedirectUrl());
      return;
    }
    if (this.user())
      (document.getElementById('courssat_checkout_modal') as HTMLDialogElement)?.showModal();
    else this.router.navigate(['auth', 'login'], { queryParams: { redirectURL: this.router.url } });
  }

  payAsYouWantHandler() {
    if (this.customPrice.value && +this.customPrice.value > 1 && !this.currentLoading()) {
      this.currentLoading.set('apply-min-price');
      this.courseService
        .payAsyouWantMinPrice()
        .pipe(finalize(() => this.currentLoading.set(null)))
        .subscribe({
          next: ({ min_price }) => {
            const usd_price = +this.customPrice.value / this.currency.value;
            if (usd_price < min_price)
              this.toastService.addToast({
                id: Date.now(),
                type: 'info',
                title: 'تنبيه',
                message: `الحد الادني للسعر ${
                  Math.ceil(min_price * this.currency.value) + ' ' + this.currency.code
                }`,
              });
            else {
              this.changePrice.emit(usd_price);
              this.toastService.addToast({
                id: Date.now(),
                type: 'success',
                title: 'تم تعديل سعر الكورس بنجاح',
              });
            }
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
}
