import { Component, inject, OnInit, signal } from '@angular/core';
import { HeroSection } from './hero-section/hero-section';
import { CategoriesSection } from './categories-section/categories-section';
import { NewCoursesSection } from './new-courses-section/new-courses-section';
import { CourseService } from '@services/course-service';
import { Course } from '@models/course';
import { PackagesSection } from './packages-section/packages-section';
import { InstructorSection } from './instructor-section/instructor-section';
import { CourseReviews } from './course-reviews/course-reviews';
import { forkJoin, noop, retry } from 'rxjs';
import { PackageService } from '@services/package-service';
import { PackageData } from '@models/package';
import { getUserCountry } from '@utils/helpers';

@Component({
  selector: 'app-home',
  imports: [
    HeroSection,
    CategoriesSection,
    NewCoursesSection,
    PackagesSection,
    InstructorSection,
    CourseReviews,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [CourseService, PackageService],
})
export class Home implements OnInit {
  courseService = inject(CourseService);
  packageService = inject(PackageService);
  newCourses = signal<Course[]>(Array(8));
  popularCourses = signal<Course[]>(Array(4));
  packageJsonData = signal<PackageData>({ data: Array(4) });

  ngOnInit(): void {
    forkJoin([
      this.courseService.getLatestCourseIds(),
      this.courseService.getLatestCourses(100),
      this.packageService.getLatestPackages(100),
      this.packageService.getCoursePackageJson(),
    ])
      .pipe(retry(3))
      .subscribe({
        next: ([{ popularCourseIds, newCourseIds }, courses, packages, packageJsonData]) => {
          const {
            eg_section_title,
            sa_section_title,
            default_section_title,
            eg_packages,
            sa_packages,
            default_packages,
            show_timer,
            end_date,
          } = packageJsonData;
          const countryCode = getUserCountry();
          const remainingTimeInSec = Math.floor((new Date(end_date).getTime() - Date.now()) / 1000);
          this.packageJsonData.set({
            title:
              countryCode === 'EG'
                ? eg_section_title
                : countryCode === 'SA'
                ? sa_section_title
                : default_section_title,
            data: (countryCode === 'EG'
              ? eg_packages
              : countryCode === 'SA'
              ? sa_packages
              : default_packages
            )
              .map(({ id, price }) => {
                const coursePackage = packages.find((p) => p.id === id);
                if (coursePackage) {
                  if (coursePackage.discountPrice) coursePackage.discountPrice = price;
                  else coursePackage.originalPrice = price;
                }
                return coursePackage;
              })
              .filter((p) => !!p)
              .slice(0, 4),
            hasTimer: show_timer && remainingTimeInSec > 0,
            startTime: remainingTimeInSec,
          });
          this.newCourses.set(
            newCourseIds
              .map((id) => courses.find((c) => c.id === id))
              .filter((c) => !!c)
              .slice(0, 8)
          );
          this.popularCourses.set(
            popularCourseIds
              .map((id) => courses.find((c) => c.id === id))
              .filter((c) => !!c)
              .slice(0, 4)
          );
        },
        error: noop,
      });
  }
}
