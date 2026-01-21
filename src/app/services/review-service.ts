import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from '@models/review';

@Injectable()
export class ReviewService {
  http = inject(HttpClient);

  getHomeReviews() {
    return this.http.get<Review[]>('json/reviews.json', {
      params: { d: Date.now() },
    });
  }
}
