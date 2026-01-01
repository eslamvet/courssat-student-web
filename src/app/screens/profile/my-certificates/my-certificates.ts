import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CourseCertificate } from '@models/certificate';
import { CertificateService } from '@services/certificate-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { switchMap, forkJoin, map, retry, delay } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-certificates',
  imports: [SlicePipe, DatePipe],
  templateUrl: './my-certificates.html',
  styleUrl: './my-certificates.css',
  providers: [CertificateService],
})
export class MyCertificates {
  certificateService = inject(CertificateService);
  toastService = inject(ToastService);
  userID = inject(UserService).user()?.id!;
  page = signal(0);
  size = signal(10);
  userCertificates = signal<CourseCertificate[]>(Array(this.size()));
  paginationPages = signal<number[] | null>(null);
  certificatebaseUrl = environment.baseUrl + '/api/FileManage/Image/5/false/';
  ngOnInit(): void {
    this.certificateService
      .getUserCertificates(this.userID, 1)
      .pipe(
        switchMap(({ list, pagination: { total_pages } }) =>
          forkJoin(
            Array.from({ length: total_pages - 1 }, (_, index) =>
              this.certificateService.getUserCertificates(this.userID, index + 2)
            )
          ).pipe(
            map((data) => {
              const userCertificates = Array.from(
                new Map<string, CourseCertificate>(
                  list.concat(data.map((d) => d.list).flat()).map((c) => [c.id, c])
                ).values()
              );
              userCertificates.reverse();
              return userCertificates;
            })
          )
        ),
        retry(3),
        delay(5000)
      )
      .subscribe({
        next: (data) => {
          this.userCertificates.set(data);
          this.paginationPages.set(
            Array.from({ length: Math.ceil(data.length / this.size()) }, (_, index) => ++index)
          );
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

  paginateHandler(page: number) {
    this.page.set(page);
  }
}
