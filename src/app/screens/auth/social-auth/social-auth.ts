import { Component, inject, Renderer2, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication-service';
import { ThemeService } from '@services/theme-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { GOOGLE_SIGNIN_SCRIPT_URL } from '@utils/constants';
import { loadScriptWithRetries } from '@utils/helpers';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
declare const google: any;

@Component({
  selector: 'app-social-auth',
  imports: [],
  template: '',
  providers: [AuthenticationService],
})
export class SocialAuth {
  authenticationService = inject(AuthenticationService);
  toastService = inject(ToastService);
  userService = inject(UserService);
  renderer = inject(Renderer2);
  routeQueryParams = inject(ActivatedRoute).snapshot.queryParams;
  router = inject(Router);
  currentTheme = inject(ThemeService).currentTheme;
  loginMethod = signal<'social' | 'normal' | null>(null);

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined') {
      this.googleInitializeHandler();
    } else {
      loadScriptWithRetries(
        GOOGLE_SIGNIN_SCRIPT_URL,
        this.renderer,
        (error) => {
          if (error) {
            this.toastService.addToast({
              id: Date.now(),
              type: 'error',
              title: 'حدث خطا ما',
              message: 'فشل تحميل تسجيل الدخول بجوجل، يرجى المحاولة مرة أخرى',
            });
            return;
          }
          this.googleInitializeHandler();
        },
        true
      );
    }
  }

  googleInitializeHandler() {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        if (this.loginMethod()) return;
        this.loginMethod.set('social');
        const payload = this.decodeGoogleJwt(response.credential);
        this.authenticationService
          .socialLogin({
            UserId: payload.sub,
            Provider: 'Google',
            FirstName: payload.given_name,
            LastName: payload.family_name,
            EmailAddress: payload.email,
            PictureUrl: payload.picture,
            OauthToken: response.credential,
            IsStudent: true,
          })
          .pipe(finalize(() => this.loginMethod.set(null)))
          .subscribe({
            next: (res) => {
              if (res.code === 200) {
                if (!res.user.isActive) {
                  this.toastService.addToast({
                    id: Date.now(),
                    type: 'info',
                    title: 'تنبيه',
                    message: 'المستخدم متوقف برجاء التواصل مع الادارة',
                  });
                  return;
                }
                localStorage.setItem('courssat-user-token', res.token);
                localStorage.setItem('courssat-user-id', res.user.id);
                this.userService.setUser(res.user);
                this.toastService.addToast({
                  id: Date.now(),
                  type: 'success',
                  title: 'تم تسجيل الدخول بنجاح',
                  message: `مرحبا ${
                    res.user.firstName +
                    (res.user.familyName && res.user.firstName !== res.user.familyName)
                      ? ' ' + res.user.familyName
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
                  message: res.message_AR ?? 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى',
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
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
      theme: this.currentTheme() === 'dark' ? 'outline' : 'filled_blue',
      size: 'large',
      width: '100%',
    });
  }

  decodeGoogleJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }
}
