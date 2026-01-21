import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Course } from '@models/course';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { categories } from '@utils/constants';
import { CourseCard } from '@components/course-card/course-card';
import { SlicePipe } from '@angular/common';
import { PaginatorPipe } from '@pipes/paginator-pipe';

@Component({
  selector: 'app-category',
  imports: [CourseCard, SlicePipe, PaginatorPipe],
  templateUrl: './category.html',
  styleUrl: './category.css',
  providers: [CourseService],
})
export class Category implements OnInit {
  route = inject(ActivatedRoute);
  courseService = inject(CourseService);
  toastService = inject(ToastService);
  category = signal(
    categories.find((c) => c.path.includes(this.route.snapshot.params['categoryId'])) ??
      categories[0]
  );
  categoryCourses = signal<Course[]>(Array(12));
  page = signal(0);
  size = signal(12);

  ngOnInit(): void {
    this.getCoursesByDepartmentHandler();
  }

  getCoursesByDepartmentHandler() {
    this.courseService.getAllCoursesByDepartmentId(this.category().id).subscribe({
      next: (data) => {
        this.categoryCourses.set(data);
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
  }
}
