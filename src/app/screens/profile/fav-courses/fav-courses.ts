import { SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Course } from '@models/course';
import { FavouriteCourseService } from '@services/favourite-course-service';
import { CourseCard } from '@components/course-card/course-card';

@Component({
  selector: 'app-fav-courses',
  imports: [SlicePipe, CourseCard],
  templateUrl: './fav-courses.html',
  styleUrl: './fav-courses.css',
})
export class FavCourses {
  page = signal(0);
  size = signal(10);
  favCourses = inject(FavouriteCourseService).favCourses;
  paginationPages = signal<number[]>(
    Array.from({ length: Math.ceil(this.favCourses().length / this.size()) }, (_, index) => ++index)
  );

  paginateHandler(page: number) {
    this.page.set(page);
  }
}
