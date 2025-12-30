import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { passwordsMatchValidator } from '@utils/helpers';
import { finalize } from 'rxjs';

type ProfileForm = {
  firstName: FormControl<string>;
  email: FormControl<string>;
  id: FormControl<string>;
  familyName: FormControl<string>;
  address: FormControl<string>;
  city: FormControl<string>;
  isActive: FormControl<boolean>;
  phoneNumber: FormControl<string>;
  imageURL: FormControl<string>;
};

type PasswordForm = {
  oldPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-personal-info',
  imports: [ReactiveFormsModule],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.css',
})
export class PersonalInfo {
  userService = inject(UserService);
  toastService = inject(ToastService);
  profileForm = new FormGroup<ProfileForm>({
    id: new FormControl(
      { value: this.userService.user()?.id!, disabled: true },
      { nonNullable: true }
    ),
    address: new FormControl(
      { value: this.userService.user()?.address ?? '', disabled: true },
      { nonNullable: true }
    ),
    city: new FormControl(
      { value: this.userService.user()?.city ?? '', disabled: true },
      { nonNullable: true }
    ),
    familyName: new FormControl(
      { value: this.userService.user()?.familyName ?? '', disabled: true },
      { nonNullable: true }
    ),
    phoneNumber: new FormControl(
      { value: this.userService.user()?.phoneNumber ?? '', disabled: true },
      { nonNullable: true }
    ),
    imageURL: new FormControl(
      { value: this.userService.user()?.imageURL ?? '', disabled: true },
      { nonNullable: true }
    ),
    isActive: new FormControl(
      { value: this.userService.user()?.isActive!, disabled: true },
      { nonNullable: true }
    ),
    firstName: new FormControl(this.userService.user()?.firstName!, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl(this.userService.user()?.email!, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  passwordForm = new FormGroup<PasswordForm>(
    {
      oldPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: passwordsMatchValidator<PasswordForm>('newPassword'),
    }
  );

  loadingState = signal<'password' | 'profile' | null>(null);

  get emailControl() {
    return this.profileForm.get('email');
  }

  get passwordControl() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPasswordControl() {
    return this.passwordForm.get('confirmPassword');
  }

  editUserProfileHandler() {
    if (this.profileForm.valid) {
      if (this.loadingState()) return;
      this.loadingState.set('profile');
      this.userService
        .editUserProfile(this.profileForm.getRawValue())
        .pipe(finalize(() => this.loadingState.set(null)))
        .subscribe({
          next: () => {
            this.toastService.addToast({
              id: Date.now(),
              type: 'success',
              title: 'تم تعديل البيانات بنجاح',
            });
            this.userService.updateUser(this.profileForm.getRawValue());
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
      this.profileForm.markAllAsTouched();
    }
  }

  changeUserPasswordHandler() {
    if (this.passwordForm.valid) {
      if (this.loadingState()) return;
      this.loadingState.set('password');
      this.userService
        .changePassword({ id: this.userService.user()?.id!, ...this.passwordForm.getRawValue() })
        .pipe(finalize(() => this.loadingState.set(null)))
        .subscribe({
          next: () => {
            this.toastService.addToast({
              id: Date.now(),
              type: 'success',
              title: 'تم تعديل كلمه المرور بنجاح',
            });
            this.userService.updateUser(this.profileForm.getRawValue());
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
      this.passwordForm.markAllAsTouched();
    }
  }
}
