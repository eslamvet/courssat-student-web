import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { PrivacyData, PrivacyPolicyService } from '@services/privacy-policy-service';
import { ToastService } from '@services/toast-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [SlicePipe],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css',
  providers: [PrivacyPolicyService],
})
export class TermsAndConditions implements OnInit {
  privacyPolicyService = inject(PrivacyPolicyService);
  loading = signal(true);
  termsData = signal<PrivacyData[]>([]);
  toastService = inject(ToastService);
  ngOnInit(): void {
    this.privacyPolicyService
      .getTerms()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.termsData.set(data);
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
