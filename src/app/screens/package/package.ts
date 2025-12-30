import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseCard } from '@components/course-card/course-card';
import { Course } from '@models/course';
import { Package } from '@models/package';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { CartService } from '@services/cart-service';
import { CurrencyService } from '@services/currency-service';
import { PackageService } from '@services/package-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { getUserCountry } from '@utils/helpers';
import { forkJoin, retry } from 'rxjs';

@Component({
  selector: 'app-package',
  imports: [CourseCard, DecimalPipe, ImgUrlPipe, NgOptimizedImage],
  templateUrl: './package.html',
  styleUrl: './package.css',
  providers: [PackageService],
})
export class PackageScreen implements OnInit {
  packageSignal = signal<Partial<Package & { courses: Course[] }>>({ courses: Array(4) });
  packageService = inject(PackageService);
  cartService = inject(CartService);
  toastService = inject(ToastService);
  currency = inject(CurrencyService).currency();
  routeParams = inject(ActivatedRoute).snapshot.params;
  user = inject(UserService).user;
  isSaudi = getUserCountry() == 'SA';
  ngOnInit(): void {
    forkJoin([
      this.packageService.getPackageDetails(this.routeParams['packageId'], this.user()?.id),
      this.packageService.getCoursePackageJson(),
    ])
      .pipe(retry(3))
      .subscribe({
        next: ([packageData, { eg_packages, sa_packages, default_packages }]) => {
          const selectedPackage = (
            getUserCountry() === 'EG'
              ? eg_packages
              : getUserCountry() === 'SA'
              ? sa_packages
              : default_packages
          ).find((p) => p.id == this.routeParams['packageId']);
          if (selectedPackage) {
            packageData.pacakge.discountPrice = selectedPackage.price;
          }
          packageData.pacakge.originalPrice = packageData.courses.reduce(
            (acc: number, c) => acc + (c.originalPrice || c.discountPrice),
            0
          );
          this.packageSignal.set({ ...packageData.pacakge, courses: packageData.courses });
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

  addToCartHandler() {
    this.cartService.addToCart({
      id: this.packageSignal().id!,
      firstName: this.packageSignal().firstName!,
      familyName: this.packageSignal().familyName!,
      courseName_AR: this.packageSignal().packageName_AR!,
      coverImageURL: this.packageSignal().imageUrl!,
      originalPrice: this.packageSignal().originalPrice,
      discountPrice: this.packageSignal().discountPrice!,
      packageId: this.packageSignal().id,
      userId: this.packageSignal().userId,
      relatedCourses: this.packageSignal().courses,
      courseNames: this.packageSignal()?.courses?.map((c: any) => c.courseName_AR),
      courseIds: this.packageSignal()?.courses?.map((c: any) => c.id),
      packageName: this.packageSignal()?.packageName_AR,
    });
  }
}
