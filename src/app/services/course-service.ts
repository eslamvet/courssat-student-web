import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Course } from '@models/course';

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
}
