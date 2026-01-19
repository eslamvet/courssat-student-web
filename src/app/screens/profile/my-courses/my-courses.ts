import { Component, inject, OnInit, signal } from '@angular/core';
import { Course } from '@models/course';
import { CourseService } from '@services/course-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { forkJoin, iif, map, of, retry, switchMap } from 'rxjs';
import { CourseCard } from '@components/course-card/course-card';
import { SlicePipe } from '@angular/common';
import { PaginatorPipe } from '@pipes/paginator-pipe';

@Component({
  selector: 'app-my-courses',
  imports: [CourseCard, SlicePipe, PaginatorPipe],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.css',
  providers: [CourseService],
})
export class MyCourses implements OnInit {
  courseService = inject(CourseService);
  toastService = inject(ToastService);
  userID = inject(UserService).user()?.id!;
  page = signal(0);
  size = signal(10);
  userCourses = signal<Course[]>(Array(this.size()));

  ngOnInit(): void {
    this.courseService
      .getUserCourses(this.userID, 1)
      .pipe(
        switchMap(({ list, pagination: { total_pages } }) =>
          iif(
            () => total_pages > 1,
            forkJoin(
              Array.from({ length: total_pages - 1 }, (_, index) =>
                this.courseService.getUserCourses(this.userID, index + 2)
              )
            ).pipe(
              map((data) => {
                const userCourses = Array.from(
                  new Map<number, Course>(
                    list.concat(data.map((d) => d.list).flat()).map((c) => [c.id, c])
                  ).values()
                );
                userCourses.reverse();
                return userCourses;
              })
            ),
            of(list)
          )
        ),
        retry(3)
      )
      .subscribe({
        next: (data) => {
          this.userCourses.set(data);
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
