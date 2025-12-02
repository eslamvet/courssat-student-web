import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ListApi } from '@models/Api';
import {
  Course,
  CourseReview,
  CustomCourseData,
  CustomCourseLabel,
  CustomCoursePrice,
} from '@models/course';
import { delay, iif, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class CourseService {
  http = inject(HttpClient);

  getLatestCourses(count: number) {
    return this.http.get<Course[]>(`/api/Course/Latest/${count}`);
  }

  getLatestCourseIds() {
    return this.http.get<{ popularCourseIds: number[]; newCourseIds: number[] }>(
      '/json/course-ids.json',
      { params: { d: Date.now() } }
    );
  }

  getCourseDetails(course_id: string, user_id = '') {
    return iif(
      () => !environment.invalid_course_ids.includes(+course_id),
      this.http.get<Course>(`${environment.secondServerUrl}/course/${course_id}`, {
        params: { user_id },
      }),
      throwError(() => new Error('لا يوجد كورس بهذا المعرف'))
    );
  }

  getCustomCourseData() {
    return this.http.get<CustomCourseData[]>('/json/custom-course-data.json', {
      params: { d: Date.now() },
    });
  }

  getCustomCourseLabels() {
    return this.http.get<CustomCourseLabel[]>('/json/custom-course-labels.json', {
      params: { d: Date.now() },
    });
  }

  getCustomCoursePrices() {
    return this.http.get<CustomCoursePrice[]>('/json/custom-course-prices.json', {
      params: { d: Date.now() },
    });
  }

  getCourseFreeLessons() {
    return this.http.get<CustomCourseData[]>('/json/course-free-lessons.json', {
      params: { d: Date.now() },
    });
  }

  getCoursesByDepartmentWithFilter(
    openKeys: string,
    departmentId: number,
    filterType: number,
    pageNo: number
  ) {
    return this.http.get<ListApi<Course>>(
      `/api/Course/Department/${openKeys}/${departmentId}/${filterType}/${pageNo}`
    );
  }

  payAsyouWantMinPrice() {
    return this.http.get<{ min_price: number }>('/json/pay-as-you-want-min-price.json', {
      params: { d: Date.now() },
    });
  }

  getCourseReviews(courseId: number, count = 10) {
    return this.http
      .get<ListApi<CourseReview>>(`/api/CourseEvaluation/${courseId}`, {
        params: { count },
      })
      .pipe(delay(5000));
  }

  addCourseReview(review: Omit<CourseReview, 'firstName' | 'familyName' | 'imageURL' | 'date'>) {
    return this.http.post('/api/CourseEvaluation', review);
  }

  getAllCoursesByDepartmentId(departmentId: number) {
    return this.http.get<Course[]>(`/api/Course/Department/${departmentId}`);
  }
}
