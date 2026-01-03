import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PrivacyPolicyService, PrivacyData } from '@services/privacy-policy-service';
import { ToastService } from '@services/toast-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-privacy-policy',
  imports: [SlicePipe],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css',
  providers: [PrivacyPolicyService],
})
export class PrivacyPolicy implements OnInit {
  privacyPolicyService = inject(PrivacyPolicyService);
  loading = signal(true);
  privacyData = signal<PrivacyData[]>([]);
  toastService = inject(ToastService);
  ngOnInit(): void {
    this.privacyPolicyService
      .getPrivacyPolicy()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.privacyData.set(data);
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
