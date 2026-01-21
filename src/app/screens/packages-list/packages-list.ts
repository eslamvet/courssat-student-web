import { SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PackageCard } from '@components/package-card/package-card';
import { Package } from '@models/package';
import { PaginatorPipe } from '@pipes/paginator-pipe';
import { PackageService } from '@services/package-service';
import { ToastService } from '@services/toast-service';
import { retry } from 'rxjs';

@Component({
  selector: 'app-packages-list',
  imports: [PackageCard, SlicePipe, PaginatorPipe],
  templateUrl: './packages-list.html',
  styleUrl: './packages-list.css',
  providers: [PackageService],
})
export class PackagesList {
  packageService = inject(PackageService);
  toastService = inject(ToastService);
  page = signal(0);
  size = signal(10);
  allPackages = signal<Package[]>(Array(this.size()));

  ngOnInit(): void {
    this.packageService
      .getLatestPackages(1000)
      .pipe(retry(3))
      .subscribe({
        next: (data) => {
          this.allPackages.set(data);
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
