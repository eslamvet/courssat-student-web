import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Coupon } from '@models/coupon';
import { environment } from 'src/environments/environment';

@Injectable()
export class CouponService {
  http = inject(HttpClient);

  applyCoupon(code: string, courseId?: number) {
    return this.http.get<Coupon>(`/api/Copon/Code/${code}/${courseId ?? 0}`);
  }

  saveCoupon(data: {
    student_email: string;
    student_name: string;
    code: string;
    course_id: string;
    course_name: string;
  }) {
    return this.http.post(`${environment.secondServerUrl}/coupon-course`, data);
  }
}
