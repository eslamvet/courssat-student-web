import { effect, inject, Injectable, signal } from '@angular/core';
import { Course } from '@models/course';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class FavouriteCourseService {
  private favCoursesSignal = signal<Course[]>(
    JSON.parse(localStorage.getItem('fav-courses') ?? '[]')
  );
  readonly favCourses = this.favCoursesSignal.asReadonly();
  private toastService = inject(ToastService);

  constructor() {
    effect(() => {
      localStorage.setItem('fav-courses', JSON.stringify(this.favCoursesSignal()));
    });
  }

  addToFavCourses(data: Course) {
    if (!this.favCoursesSignal().find((c) => c.id == data.id)) {
      this.favCoursesSignal.update((prev) => [data, ...prev]);
      this.toastService.addToast({
        id: Date.now(),
        type: 'success',
        title: 'تم اضافة الكورس بنجاح الي المفضله',
        iconClass: 'mdi--book-favorite',
      });
    } else {
      this.favCoursesSignal.update((prev) => prev.filter((c) => c.id !== data.id));
      this.toastService.addToast({
        id: Date.now(),
        type: 'info',
        title: 'تنبيه',
        message: 'تم حذف الكورس من المفضله',
      });
    }
  }

  isFavCourse(id: number) {
    return !!this.favCoursesSignal().find((c) => c.id === id);
  }
}
