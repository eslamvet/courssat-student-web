import { AsyncPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  NgZone,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListApi } from '@models/Api';
import { Course } from '@models/course';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CourseService } from '@services/course-service';
import { CurrencyService } from '@services/currency-service';
import { ToastService } from '@services/toast-service';
import { UserCountry } from '@utils/constants';
import { getUserCountry } from '@utils/helpers';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, NgOptimizedImage, ImgUrlPipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection implements AfterViewInit {
  ngZone = inject(NgZone);
  courseService = inject(CourseService);
  toastService = inject(ToastService);
  currency = inject(CurrencyService).currency();
  userCountry = getUserCountry();
  UserCountry = UserCountry;
  isMobile = matchMedia('(width <= 640px)').matches;
  gridCols;
  items = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Vue', 'Svelte', 'Node.js', 'NestJS'];
  searchInput = new FormControl('', { nonNullable: true });
  filteredCourses = signal<Course[]>([]);
  filteredCoursesPagination = signal<ListApi<Course>['pagination']>({
    current_page: 1,
    total_pages: 1,
    total_items: 1,
  });
  isInputFocused = signal(false);
  constructor() {
    const maxImage = 20;
    let current = 0;
    let direction = 1;
    this.gridCols = signal(
      Array.from({ length: this.isMobile ? 4 : 8 }, () =>
        Array.from({ length: this.isMobile ? 6 : 7 }, () => {
          if (current === maxImage) direction = -1;
          if (current === 1) direction = 1;
          return `images/instructor-${direction === -1 ? --current : ++current}.jpg`;
        })
      )
    );
  }

  filterCoursesHandler(loadMore = false) {
    if (this.filteredCourses().find((c) => !c?.id)) return;
    if (loadMore) this.filteredCourses.update((prev) => [...prev, ...Array(5)]);
    else {
      this.filteredCourses.set(Array(5));
      this.filteredCoursesPagination.update((prev) => ({ ...prev, current_page: 1 }));
    }
    this.courseService
      .getCoursesByDepartmentWithFilter(
        this.searchInput.value,
        0,
        1,
        this.filteredCoursesPagination().current_page
      )
      .subscribe({
        next: ({ list, pagination }) => {
          this.filteredCourses.update((prev) => [...prev.filter((c) => c?.id), ...list]);
          this.filteredCoursesPagination.set({
            ...pagination,
            current_page: pagination.current_page + 1,
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

  loadMoreCourses(ev: any) {
    ev.target.scrollTop + ev.target.clientHeight >= ev.target.scrollHeight - 1 &&
      this.filteredCoursesPagination().current_page <=
        this.filteredCoursesPagination().total_pages &&
      this.filterCoursesHandler(true);
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const galleryImages = document.querySelectorAll('.gallery__grid__col');
      const galleryContainer = document.getElementById('gallery__grid') as HTMLDivElement;
      let num = 0;
      let inverted = false;
      const animate = () => {
        if (num && num == galleryContainer.scrollHeight - galleryContainer.clientHeight)
          inverted = true;
        else if (num == 0 && inverted) inverted = false;
        galleryImages.forEach((img) => {
          img.setAttribute('style', `transform:translateY(-${num}px)`);
        });
        !inverted ? num++ : num--;
        window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    });
  }
}
