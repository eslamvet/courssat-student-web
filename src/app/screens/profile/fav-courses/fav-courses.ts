import { SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FavouriteCourseService } from '@services/favourite-course-service';
import { CourseCard } from '@components/course-card/course-card';
import { PaginatorPipe } from '@pipes/paginator-pipe';

@Component({
  selector: 'app-fav-courses',
  imports: [SlicePipe, CourseCard, PaginatorPipe],
  templateUrl: './fav-courses.html',
  styleUrl: './fav-courses.css',
})
export class FavCourses {
  page = signal(0);
  size = signal(10);
  favCourses = inject(FavouriteCourseService).favCourses;

  paginateHandler(page: number) {
    this.page.set(page);
  }
}
