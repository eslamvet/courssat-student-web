import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '@services/authentication-service';
import { SocialAuth } from '../social-auth/social-auth';
import { finalize } from 'rxjs';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: {
    class: 'basis-full lg:basis-1/2',
  },
  providers: [AuthenticationService],
})
export class Login extends SocialAuth {
  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  loginUserHandler() {
    if (this.loginForm.valid) {
      if (this.loginMethod()) {
        return;
      }
      this.loginMethod.set('normal');
      this.authenticationService
        .login(this.loginForm.getRawValue())
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
      this.loginForm.markAllAsTouched();
    }
  }
}
