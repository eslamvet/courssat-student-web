import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { COUPONTYPE } from '@models/coupon';
import { Course } from '@models/course';
import { ConfirmCourseOrder } from '@models/CoursePurchase';
import { User } from '@models/user';
import { generateOrderBody } from '@utils/helpers';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CertificateService } from './certificate-service';

@Injectable()
export class OrderService {
  http = inject(HttpClient);
  certificateService = inject(CertificateService);

  createOrder(
    user: User,
    totalValue: number,
    totalOriginalValue: number,
    courses: Partial<Course>[],
    cobonId?: number
  ) {
    const orderData = generateOrderBody(user, totalValue, totalOriginalValue, courses, cobonId);
    return this.http.post('/api/Payment', orderData).pipe(
      switchMap(() =>
        forkJoin([
          ...orderData.paymentDetailVMs
            .reduce((acc: ConfirmCourseOrder[], p) => {
              const instructorCourseOrder = acc.find((el) => el.instructor_id == p.instructorId);
              if (instructorCourseOrder) {
                instructorCourseOrder.total_price += p.totalValue;
                instructorCourseOrder.courses_names.push(
                  ...(p.packagesId ? p.courseNames! : [p.courseName])
                );
                instructorCourseOrder.courses_ids.push(
                  ...(p.packagesId ? p.courseIds! : [p.courseId!])
                );
                if (instructorCourseOrder.coupon && instructorCourseOrder.coupon.discount) {
                  let discount = p.originalValue - p.totalValue;
                  instructorCourseOrder.coupon.discount = (
                    +instructorCourseOrder.coupon.discount + (discount > 0 ? discount : 0)
                  ).toFixed(2);
                }
              } else {
                let discount = p.originalValue - p.totalValue;
                acc.push({
                  student_name: orderData.userName,
                  student_email: orderData.userEmail,
                  total_price: p.totalValue,
                  courses_names: p.packagesId ? p.courseNames! : [p.courseName],
                  courses_ids: p.packagesId ? p.courseIds! : [p.courseId!],
                  instructor_id: p.instructorId,
                  ...(p.packagesId && { package: p.courseName }),
                  ...(p.coupon && {
                    coupon: {
                      code: p.coupon.coboneCode,
                      type:
                        p.coupon.coboneType == 0
                          ? COUPONTYPE.FREE
                          : p.coupon.coboneType == 1
                          ? COUPONTYPE.AMOUNT
                          : p.coupon.coboneType == 2
                          ? COUPONTYPE.PAYASYOUWANT
                          : COUPONTYPE.PERCENTAGE,
                      ...(p.coupon.coboneType && {
                        discount: discount > 0 ? discount.toFixed(2) : 0,
                        userId: p.coupon.userId,
                      }),
                    },
                  }),
                });
              }
              return acc;
            }, [])
            .map((payload) =>
              this.http.post(`${environment.secondServerUrl}/course-order`, payload)
            ),
          ...orderData.paymentDetailVMs.map((d) =>
            this.certificateService.createCourseCertificate({
              id: d.courseName,
              certificateName_EN: d.courseName,
              certificateName_AR: d.courseName,
              certificateURL: d.courseName,
              courseId: d.courseId!,
              courseName: d.courseName,
              userId: orderData.userId,
            })
          ),
        ]).pipe(catchError(() => EMPTY))
      )
    );
  }

  createStripePaymentIntent(data: { amount: number; currency: string; cardsOnly?: boolean }) {
    return this.http.post<{ paymentIntentId: string; clientSecret: string }>(
      `${environment.secondServerUrl}/meeting-order/create-stripe-payment-intent`,
      data
    );
  }

  verifyStripePaymentIntent(data: { paymentIntentId: string }) {
    return this.http.post(
      `${environment.secondServerUrl}/meeting-order/verify-stripe-payment`,
      data
    );
  }

  createTapCharge(data: {
    amount: string;
    currency: string;
    description: string;
    source: { id: string };
    customer: {
      first_name: string;
      email: string;
      last_name: string;
      phone?: { country_code: number; number: number };
    };
    metadata?: { [key: string]: any };
    post?: { url: string };
  }) {
    return this.http.post<{ data: { transaction: { url: string } } }>(
      `${environment.secondServerUrl}/meeting-order/create-tap-charge`,
      data
    );
  }
}
