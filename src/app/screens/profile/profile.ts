import { NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { finalize, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ImgUrlPipe, NgOptimizedImage],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  userService = inject(UserService);
  toastService = inject(ToastService);
  user = this.userService.user;
  loading = signal(false);
  changeUserImgHandler(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      this.loading.set(true);
      const formData = new FormData();
      formData.append('file', file);
      this.userService
        .uploadAttachment(formData)
        .pipe(
          switchMap(({ fileName: imageURL }) =>
            this.userService
              .editUserProfile({
                firstName: this.user()?.firstName!,
                email: this.user()?.email!,
                id: this.user()?.id!,
                familyName: this.user()?.familyName!,
                address: this.user()?.address,
                city: this.user()?.city,
                isActive: this.user()?.isActive!,
                phoneNumber: this.user()?.phoneNumber,
                imageURL,
              })
              .pipe(map(() => imageURL))
          ),
          finalize(() => this.loading.set(false))
        )
        .subscribe({
          next: (imageURL) => {
            this.userService.updateUser({ imageURL });
            this.toastService.addToast({
              id: Date.now(),
              type: 'success',
              title: 'تم تعديل البيانات بنجاح',
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
  }
}
