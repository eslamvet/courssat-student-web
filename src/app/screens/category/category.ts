import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListApi, MakeOptional } from '@models/Api';
import { Course } from '@models/course';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { categories } from '@utils/constants';
import { CourseCard } from '@components/course-card/course-card';
import { delay } from 'rxjs';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-category',
  imports: [CourseCard, SlicePipe],
  templateUrl: './category.html',
  styleUrl: './category.css',
  providers: [CourseService],
})
export class Category implements OnInit {
  route = inject(ActivatedRoute);
  courseService = inject(CourseService);
  toastService = inject(ToastService);
  courseDepartmentSignal = signal<
    MakeOptional<ListApi<Course>, 'pagination'> & Partial<(typeof categories)[0]>
  >({
    list: Array(12),
  });
  page = signal(0);
  size = signal(12);

  ngOnInit(): void {
    this.getCoursesByDepartmentHandler();
  }

  getCoursesByDepartmentHandler() {
    const department =
      categories.find((c) => c.path.includes(this.route.snapshot.params['categoryId'])) ??
      categories[0];
    this.courseService
      .getAllCoursesByDepartmentId(department.id)
      .pipe(delay(5000))
      .subscribe({
        next: (data) => {
          this.courseDepartmentSignal.set({
            ...department,
            list: data,
            pagination: {
              current_page: 0,
              total_count: data.length,
              pages: Array.from(
                { length: Math.ceil(data.length / this.size()) },
                (_, index) => ++index
              ),
              total_pages: Math.ceil(data.length / this.size()),
              total_items: data.length,
            },
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
  }

  paginateHandler(page: number) {
    this.page.set(page);
    this.courseDepartmentSignal.update((d) => ({
      ...d,
      pagination: { ...d.pagination!, current_page: page },
    }));
  }
}
