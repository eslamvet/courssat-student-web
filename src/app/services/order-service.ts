import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Course } from '@models/course';
import { User } from '@models/user';
import { generateOrderBody } from '@utils/helpers';

@Injectable()
export class OrderService {
  http = inject(HttpClient);
  createOrder(
    user: User,
    totalValue: number,
    totalOriginalValue: number,
    courses: Course[],
    cobonId?: number,
    stringify?: boolean
  ) {
    return this.http.post(
      '/api/Payment',
      generateOrderBody(user, totalValue, totalOriginalValue, courses, cobonId, stringify)
    );
  }
}
