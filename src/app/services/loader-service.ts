import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  document = inject(DOCUMENT);
  private loaderSignal = signal(false);
  readonly showLoader = this.loaderSignal.asReadonly();

  constructor() {
    effect(() => {
      if (this.showLoader()) {
        this.document.body.style.overflowY = 'hidden';
      } else {
        this.document.body.style.overflowY = 'auto';
      }
    });
  }

  toggleLoader(data: boolean) {
    this.loaderSignal.set(data);
  }
}
