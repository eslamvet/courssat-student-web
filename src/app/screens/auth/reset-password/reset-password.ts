import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication-service';
import { ThemeService } from '@services/theme-service';
import { ToastService } from '@services/toast-service';
import { passwordsMatchValidator } from '@utils/helpers';
import { finalize } from 'rxjs';

type ResetPasswordForm = {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassowrd: FormControl<string>;
  confirmPassword: FormControl<string>;
  token: FormControl<string>;
};

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  host: {
    class: 'basis-full lg:basis-1/2',
  },
  providers: [AuthenticationService],
})
export class ResetPassword {
  authenticationService = inject(AuthenticationService);
  toastService = inject(ToastService);
  router = inject(Router);
  token = inject(ActivatedRoute).snapshot.queryParams['token'];
  currentTheme = inject(ThemeService).currentTheme;
  loading = signal(false);
  resetPasswordForm = new FormGroup<ResetPasswordForm>(
    {
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
      confirmPassowrd: new FormControl('', {
        nonNullable: true,
      }),
      token: new FormControl(this.token, {
        nonNullable: true,
      }),
    },
    {
      validators: passwordsMatchValidator<ResetPasswordForm>,
    }
  );

  get emailControl() {
    return this.resetPasswordForm.get('email');
  }

  get passwordControl() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPasswordControl() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  resetUserPasswordHandler() {
    if (this.resetPasswordForm.valid) {
      if (this.loading()) {
        return;
      }
      this.loading.set(true);
      this.authenticationService
        .resetPassword({
          ...this.resetPasswordForm.getRawValue(),
          confirmPassowrd: this.confirmPasswordControl?.getRawValue(),
        })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.toastService.addToast({
              id: Date.now(),
              type: 'success',
              title: 'نجاح',
              message: 'تم تغيير كلمة المرور بنجاح',
            });
            this.router.navigateByUrl('/auth/login', { replaceUrl: true });
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
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
