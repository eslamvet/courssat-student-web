import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication-service';
import { ThemeService } from '@services/theme-service';
import { ToastService } from '@services/toast-service';
import { finalize } from 'rxjs';

type ForgetPasswordForm = {
  email: FormControl<string>;
};

@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
  host: {
    class: 'basis-full lg:basis-1/2',
  },
  providers: [AuthenticationService],
})
export class ForgetPassword {
  authenticationService = inject(AuthenticationService);
  toastService = inject(ToastService);
  router = inject(Router);
  currentTheme = inject(ThemeService).currentTheme;
  loading = signal(false);
  forgetPasswordForm = new FormGroup<ForgetPasswordForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  get emailControl() {
    return this.forgetPasswordForm.get('email');
  }

  sendEmailHandler() {
    if (this.forgetPasswordForm.valid) {
      if (this.loading()) {
        return;
      }
      this.loading.set(true);
      this.authenticationService
        .forgetPassword(this.forgetPasswordForm.getRawValue().email)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.toastService.addToast({
              id: Date.now(),
              type: 'success',
              title: 'نجاح',
              message: 'تم الارسال بنجاح يمكنك التحقق من بريدك الالكتروني',
            });
            this.router.navigate(['/']);
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
      this.forgetPasswordForm.markAllAsTouched();
    }
  }
}
