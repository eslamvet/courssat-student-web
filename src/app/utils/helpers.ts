import { inject, Renderer2 } from '@angular/core';
import { Course } from '@models/course';
import { CoursePurchase } from '@models/CoursePurchase';
import { User } from '@models/user';
import { CurrencyService } from '@services/currency-service';
import { UserService } from '@services/user-service';
import { catchError, EMPTY, forkJoin, map } from 'rxjs';

export const appInitializerFn = () => {
  const userService = inject(UserService);
  const currencyService = inject(CurrencyService);
  const userCountry = getUserCountry();
  return forkJoin([
    userService.getUserProfile(JSON.parse(localStorage.getItem('courssat-user') ?? 'null')?.id),
    currencyService.getCurrencyApi(userCountry),
  ]).pipe(
    map(([user, currency]) => {
      user && userService.setUser(user);
      currency &&
        currencyService.setCurrency({
          code: userCountry == 'EG' ? '\u0020' + 'ج.م' : '\u200F' + '\u0020' + '\uE900',
          value: currency.usd[userCountry == 'EG' ? 'egp' : 'sar'],
        });
      return 'done';
    }),
    catchError(() => EMPTY)
  );
};

export const getUserCountry = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timezone == 'Africa/Cairo' ? 'EG' : timezone == 'Asia/Riyadh' ? 'SA' : 'Other';
};

export const generateOrderBody = (
  user: User,
  totalValue: number,
  totalOriginalValue: number,
  courses: Partial<Course>[],
  cobonId?: number
): CoursePurchase => {
  const paymentDetailVMs = courses.map((c) => ({
    id: 0,
    courseImg: c.coverImageURL!,
    paymentId: 0,
    courseName: c.courseName_AR!,
    courseId: c.packageId ? null : c.id!,
    packagesId: c.packageId ?? null,
    originalValue: c.originalPrice!,
    totalValue: c.discountPrice!,
    cobonId: c.coupon?.id,
    coupon: c.coupon,
    instructorId: c.userId!,
    ...(c?.packageId && {
      courseNames: c.relatedCourses?.map((c) => c.courseName_AR),
      courseIds: c.relatedCourses?.map((c) => c.id),
    }),
  }));

  return {
    id: 0,
    userId: user.id,
    userName: user.firstName + (user.familyName ?? ''),
    userEmail: user.email,
    totalOriginalValue,
    totalValue,
    cobonId,
    paymentDetailVMs,
  };
};

export const loadScriptWithRetries = (
  src: string,
  renderer: Renderer2,
  callback: (arg: Error | null) => void,
  parentElement = document.body,
  maxRetries = 2
) => {
  let attempts = 0;
  let timeOut: any;
  const tryLoadScript = () => {
    attempts++;
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      renderer.removeChild(parentElement, existingScript);
    }
    const script = renderer.createElement('script');
    renderer.setAttribute(script, 'src', src);
    renderer.listen(script, 'load', () => {
      console.log(`Script loaded successfully: ${src}`);
      timeOut && clearTimeout(timeOut);
      if (callback) callback(null);
    });
    renderer.listen(script, 'error', () => {
      console.error(`Failed to load script: ${src} (Attempt ${attempts}/${maxRetries})`);
      timeOut && clearTimeout(timeOut);
      if (attempts < maxRetries) {
        timeOut = setTimeout(tryLoadScript, 3000);
      } else {
        if (callback) callback(new Error(`Failed to load script after ${maxRetries} attempts`));
      }
    });
    renderer.appendChild(parentElement, script);
  };
  tryLoadScript.call(this);
};
