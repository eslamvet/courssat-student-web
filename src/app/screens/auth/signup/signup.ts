import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '@services/authentication-service';
import { SocialAuth } from '../social-auth/social-auth';
import { finalize } from 'rxjs';
import { passwordsMatchValidator } from '@utils/helpers';

type SignupForm = {
  firstName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  id: FormControl;
  familyName: FormControl;
  countryId: FormControl;
  phoneNumber: FormControl;
  imageURL: FormControl;
  isActive: FormControl;
  roleType: FormControl;
  endTrielDate: FormControl;
  isTrial: FormControl;
  experianceYearNum: FormControl;
  experianceBrief: FormControl;
  instructorBuyDegree: FormControl;
  departId: FormControl;
  jobId: FormControl;
  creationDate: FormControl;
  address: FormControl;
  city: FormControl;
  roles: FormControl;
};

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  host: {
    class: 'basis-full lg:basis-1/2',
  },
  providers: [AuthenticationService],
})
export class Signup extends SocialAuth {
  signupForm = new FormGroup<SignupForm>(
    {
      firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      familyName: new FormControl(''),
      id: new FormControl(''),
      countryId: new FormControl(1),
      phoneNumber: new FormControl(''),
      imageURL: new FormControl(''),
      isActive: new FormControl(true),
      roleType: new FormControl(0),
      endTrielDate: new FormControl(''),
      isTrial: new FormControl(''),
      experianceYearNum: new FormControl(''),
      experianceBrief: new FormControl(''),
      instructorBuyDegree: new FormControl(''),
      departId: new FormControl(null),
      jobId: new FormControl(null),
      creationDate: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      roles: new FormControl([]),
    },
    {
      validators: passwordsMatchValidator<SignupForm>,
    }
  );

  get emailControl() {
    return this.signupForm.get('email');
  }

  get passwordControl() {
    return this.signupForm.get('password');
  }

  get confirmPasswordControl() {
    return this.signupForm.get('confirmPassword');
  }

  registerUserHandler() {
    if (this.signupForm.valid) {
      if (this.loginMethod()) {
        return;
      }
      this.loginMethod.set('normal');
      this.authenticationService
        .registerUser(this.signupForm.getRawValue())
        .pipe(finalize(() => this.loginMethod.set(null)))
        .subscribe({
          next: (response) => {
            if (response.code === 200) {
              if (!response.user.isActive) {
                this.toastService.addToast({
                  id: Date.now(),
                  type: 'info',
                  title: 'تنبيه',
                  message: 'المستخدم متوقف برجاء التواصل مع الادارة',
                });
                return;
              }
              localStorage.setItem('courssat-user-token', response.token);
              localStorage.setItem('courssat-user-id', response.user.id);
              this.userService.setUser(response.user);
              this.toastService.addToast({
                id: Date.now(),
                type: 'success',
                title: 'تم تسجيل الدخول بنجاح',
                message: `مرحبا ${
                  response.user.firstName +
                  (response.user.familyName && response.user.firstName !== response.user.familyName)
                    ? ' ' + response.user.familyName
                    : ''
                }`,
              });
              if (this.routeQueryParams['redirectURL']) {
                this.router.navigateByUrl(this.routeQueryParams['redirectURL'], {
                  replaceUrl: true,
                  ...(this.routeQueryParams['applyCoupon'] && {
                    queryParams: { applyCoupon: this.routeQueryParams['applyCoupon'] },
                  }),
                });
              } else {
                this.router.navigateByUrl('/', { replaceUrl: true });
              }
            } else {
              this.toastService.addToast({
                id: Date.now(),
                type: 'error',
                title: 'حدث خطا ما',
                message: response.message_AR ?? 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى',
              });
            }
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
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
