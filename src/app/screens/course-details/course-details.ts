import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CourseSidebar } from './course-sidebar/course-sidebar';
import { CourseRelatedCourses } from './course-related-courses/course-related-courses';
import { CourseVideo } from './course-video/course-video';
import { CourseTabs } from './course-tabs/course-tabs';
import { Course, CourseAttachment, CourseLesson } from '@models/course';
import { CourseService } from '@services/course-service';
import { UserService } from '@services/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, pairwise, retry, switchMap, tap } from 'rxjs';
import { CurrencyService } from '@services/currency-service';
import { getUserCountry } from '@utils/helpers';
import { ActiveLessonPipe } from '@pipes/active-lesson-pipe';
import { CartService } from '@services/cart-service';
import { Coupon } from '@models/coupon';
import { OrderService } from '@services/order-service';
import { User } from '@models/user';
import { LoaderService } from '@services/loader-service';
import { ToastService } from '@services/toast-service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PaymentMethods } from '@components/payment-methods/payment-methods';
import { CertificateService } from '@services/certificate-service';
import { FavouriteCourseService } from '@services/favourite-course-service';
import { UserCountry } from '@utils/constants';

@Component({
  selector: 'app-course-details',
  imports: [
    CourseSidebar,
    CourseRelatedCourses,
    CourseVideo,
    CourseTabs,
    ActiveLessonPipe,
    PaymentMethods,
  ],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
  providers: [CourseService, OrderService, CertificateService],
})
export class CourseDetails implements OnInit {
  courseService = inject(CourseService);
  userService = inject(UserService);
  cartService = inject(CartService);
  orderService = inject(OrderService);
  loaderService = inject(LoaderService);
  toastService = inject(ToastService);
  favCourseService = inject(FavouriteCourseService);
  currencyService = inject(CurrencyService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  courseLoading = signal(true);
  courseSignal = signal<Course>({} as Course);
  courseArr = computed(() => [this.courseSignal()]);
  relatedCourses = signal<Course[]>(Array(4));
  activeTap = signal<'overview' | 'content' | 'reviews'>('overview');
  isMobile = matchMedia('(width <= 640px)').matches;

  constructor() {
    effect(() => {
      if (this.courseSignal().isPaied) {
        const watchedCourses = JSON.parse(localStorage.getItem('watched-courses') ?? '{}');
        watchedCourses[this.courseSignal().id] = this.courseSignal();
        localStorage.setItem('watched-courses', JSON.stringify(watchedCourses));
      }
    });
    toObservable(this.userService.user)
      .pipe(pairwise(), takeUntilDestroyed())
      .subscribe(([prevState, nextState]) => {
        if (!nextState) this.courseSignal.update((c) => ({ ...c, isPaied: false }));
      });
  }

  ngOnInit(): void {
    let firstRender = true;
    this.route.params
      .pipe(
        tap({
          next: () => {
            if (!firstRender) {
              this.relatedCourses.set(Array(4));
              this.courseLoading.set(true);
              this.activeTap.set('overview');
            }
            firstRender = false;
          },
        }),
        switchMap(({ courseId }) =>
          forkJoin([
            this.courseService.getCourseDetails(courseId, this.userService.user()?.id),
            this.courseService.getCustomCourseData(),
            this.courseService.getCustomCourseLabels(),
            this.courseService.getCustomCoursePrices(),
            this.courseService.getCourseFreeLessons(),
          ])
        ),
        retry(3)
      )
      .subscribe({
        next: ([course, customData, customLabels, customPrices, freeLessons]) => {
          course.isPaied = !course.topics.some((t) =>
            t.lessonList.some(
              (l) => l.videoUrl == null && l.fileUrl == null && l.fileExternalUrl == null
            )
          );
          course.courseDataVMs = course.courseDataVMs.filter(
            (d) => d.question && d.answers.length && d.answers[0]?.answer
          );
          let customCourse;
          if (!course.isPaied) {
            const customPrice = customPrices.find((p) => p['course-id'] == course.id);
            if (
              customPrice &&
              [UserCountry.EG, UserCountry.SA].includes(
                getUserCountry() as typeof UserCountry.EG | typeof UserCountry.SA
              )
            ) {
              course.discountPrice = Math.ceil(
                (getUserCountry() === 'EG' ? customPrice['egp-price'] : customPrice['sar-price']) /
                  this.currencyService.currency().value
              );
            }
            customCourse =
              customData.find((c) => c.id == course.id) ??
              freeLessons.find((l) => l.id == course.id);
            const paymentLabel = (
              customLabels.find((l) => l.course_ids?.includes(course.id)) ??
              customLabels.find((l) => l.allCourses)
            )?.label;
            if (paymentLabel) {
              course.paymentLabel = paymentLabel;
            }
            if (customCourse) {
              let freeLessons: CourseLesson[] = [];
              let isRegularStudent = !(
                course.isPaied ||
                this.userService.user()?.roleType == 1 ||
                course.userId == this.userService.user()?.id
              );
              customCourse.sections_with_free_lessons.forEach((section) => {
                section.free_lessons_indexes.forEach((lessonIndex) => {
                  course.topics[section.index - 1].lessonList[lessonIndex - 1].public = true;
                  isRegularStudent &&
                    freeLessons.push(course.topics[section.index - 1].lessonList[lessonIndex - 1]);
                });
              });
              isRegularStudent &&
                course.topics.unshift({
                  id: 0,
                  topicName_AR: 'الدروس المجانية',
                  lessonList: freeLessons,
                });
            }
            course.topics.unshift({
              id: 0,
              topicName_AR: 'المقدمة',
              isActive: true,
              lessonList: [
                {
                  name_AR: 'برومو الكورس',
                  videoUrl: course.videoPromoURL,
                  id: 0,
                  isActive: true,
                  public: true,
                  courseId: course.id,
                },
              ],
            });
          } else {
            const watchedCourses = JSON.parse(localStorage.getItem('watched-courses') ?? '{}');
            if (watchedCourses[course.id]) course.topics = watchedCourses[course.id].topics;
            else
              course.topics.unshift({
                id: 0,
                topicName_AR: 'المقدمة',
                isActive: true,
                lessonList: [
                  {
                    name_AR: 'برومو الكورس',
                    videoUrl: course.videoPromoURL,
                    id: 0,
                    isActive: true,
                    public: true,
                    courseId: course.id,
                  },
                ],
              });
          }
          course.attachments = course.topics.reduce<{ title: string; data: CourseAttachment[] }[]>(
            (acc, t) => {
              const fileList = t.fileList ?? [];
              const data = fileList.concat(
                t.lessonList
                  .filter((l) => l.fileExternalUrl || l.fileUrl)
                  .map((l) => ({
                    attachmentFileName: l.fileName,
                    id: Math.random(),
                    lessonName: l.name_AR,
                    attachmentLink: l.fileUrl,
                    attachmentName: l.fileUrlName,
                    attachmentsExternalLink: l.fileExternalUrl,
                  }))
              );
              data.length &&
                acc.push({
                  title: t.topicName_AR,
                  data,
                });
              return acc;
            },
            []
          );
          this.courseSignal.set({ ...course, ...(customCourse && customCourse) });
          this.courseLoading.set(false);
          this.courseService
            .getCoursesByDepartmentWithFilter('', course.departmentsId, 1, 1)
            .subscribe({
              next: ({ list: relatedCoursesList }) => {
                this.relatedCourses.set(relatedCoursesList.slice(0, 4));
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

  loadNextVideoHandler(lesson: CourseLesson) {
    if (this.courseSignal()!.isPaied) {
      let nextLesson: CourseLesson | null = null;
      if (lesson.tIndex == this.courseSignal()!.topics.length - 1) {
        if (lesson.lIndex != this.courseSignal()!.topics[lesson.tIndex].lessonList.length - 1) {
          nextLesson = this.courseSignal()!.topics[lesson.tIndex!].lessonList[lesson.lIndex! + 1];
        }
      } else {
        if (lesson.lIndex != this.courseSignal()!.topics[lesson.tIndex!].lessonList.length - 1) {
          nextLesson = this.courseSignal()!.topics[lesson.tIndex!].lessonList[lesson.lIndex! + 1];
        } else {
          nextLesson = this.courseSignal()!.topics[lesson.tIndex! + 1].lessonList[0];
        }
      }
      // console.log('nextLesson', nextLesson, lesson);
      this.courseSignal.update((c) => ({
        ...c,
        topics: c.topics.map((t) => {
          let isActive = false;
          let watchedLessonsNum = 0;
          const lessonList = t.lessonList.map((l) => {
            if (nextLesson?.id === l.id) isActive = true;
            if (l.isWatched || l.id === lesson.id) watchedLessonsNum++;
            return l.id === lesson.id
              ? {
                  ...l,
                  isWatched: true,
                  autoplay: false,
                  isActive: false,
                }
              : nextLesson && nextLesson.id === l.id
              ? {
                  ...l,
                  autoplay: true,
                  isActive: true,
                }
              : l;
          });
          return {
            ...t,
            lessonList,
            isActive,
            isWatched: watchedLessonsNum === t.lessonList.length,
          };
        }),
      }));
    }
  }

  setActiveLessonHandle(lessonId: number) {
    this.courseSignal.update((c) => ({
      ...c,
      topics: c.topics.map((t) => {
        let isActive;
        let watchedLessonsNum = 0;
        const lessonList = t.lessonList.map((l) => {
          if (l.id === lessonId) isActive = true;
          if (l.isWatched) watchedLessonsNum++;
          return l.id !== lessonId
            ? {
                ...l,
                autoplay: false,
                isActive: false,
              }
            : {
                ...l,
                autoplay: true,
                isActive: true,
              };
        });
        return {
          ...t,
          lessonList,
          isActive,
          isWatched: watchedLessonsNum === t.lessonList.length,
        };
      }),
    }));
  }

  addToCartHandler() {
    this.cartService.addToCart(this.courseSignal());
  }

  applyCouponHandler(coupon: Coupon | null) {
    if (coupon) {
      if (coupon.coboneType == 0 || coupon.success) {
        this.loaderService.toggleLoader(true);
        this.orderService
          .createOrder(
            this.userService.user() as User,
            0,
            this.courseSignal().originalPrice,
            [{ ...this.courseSignal(), coupon, discountPrice: 0 }],
            coupon.id
          )
          .pipe(finalize(() => this.loaderService.toggleLoader(false)))
          .subscribe({
            next: () => {
              this.courseSignal.update((c) => ({ ...c, isPaied: true }));
              this.toastService.addToast({
                id: Date.now(),
                type: 'success',
                title: 'تم تفعيل الكوبون وشراء الكورس بنجاح',
                iconClass: 'solar--bill-check-outline',
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
        return;
      } else if (coupon.coboneType == 2) {
        this.courseSignal.update((c) => ({ ...c, coupon }));
      } else {
        let discountPrice = 0;
        let price = this.courseSignal().discountPrice || this.courseSignal().originalPrice;
        switch (coupon.coboneType) {
          case 1:
            discountPrice = price - coupon.value;
            break;
          case 3:
            discountPrice = Math.ceil(price - (price / 100) * coupon.value);
            break;
        }
        if (!this.cartService.cart().coupon) {
          const cartItems = [...this.cartService.cart().items];
          const cIndex = cartItems.findIndex((c) => c.id == this.courseSignal().id);
          if (cIndex != -1) {
            cartItems[cIndex].priceBeforeCoupon = cartItems[cIndex].discountPrice;
            cartItems[cIndex].discountPrice = discountPrice;
            cartItems[cIndex].coupon = coupon;
            this.cartService.setCart({ coupon, items: cartItems });
          }
        }
        this.courseSignal.update((c) => ({
          ...c,
          coupon,
          priceBeforeCoupon: c.discountPrice,
          discountPrice,
        }));
      }
      this.toastService.addToast({
        id: Date.now(),
        type: 'success',
        title: 'تم تفعيل الكوبون بنجاح',
        iconClass: 'solar--bill-check-outline',
      });
    } else {
      if (this.cartService.cart().coupon?.id === this.courseSignal().coupon?.id) {
        const cartItems = [...this.cartService.cart().items];
        const cIndex = cartItems.findIndex((c) => c.id == this.courseSignal().id);
        if (cIndex != -1) {
          cartItems[cIndex].discountPrice = cartItems[cIndex].priceBeforeCoupon;
          cartItems[cIndex].priceBeforeCoupon = 0;
          cartItems[cIndex].coupon = undefined;
          this.cartService.setCart({ coupon: null, items: cartItems });
        }
      }
      this.courseSignal.update((c) => ({
        ...c,
        coupon: undefined,
        discountPrice: c.priceBeforeCoupon,
        priceBeforeCoupon: 0,
      }));
      this.toastService.addToast({
        id: Date.now(),
        type: 'success',
        title: 'تم الغاء الكوبون بنجاح',
      });
    }
  }

  changeCoursePriceHandler(discountPrice: number) {
    this.courseSignal.update((c) => ({
      ...c,
      discountPrice,
      priceBeforeCoupon: c.discountPrice,
    }));
  }

  addToFavCoursesHandler() {
    this.favCourseService.addToFavCourses(this.courseSignal());
  }
}
