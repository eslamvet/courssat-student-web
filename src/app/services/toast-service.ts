import { Injectable, signal } from '@angular/core';
import { Toast } from '@models/toast';
import { noop } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSignal = signal<Toast[]>([]);
  readonly toasts = this.toastSignal.asReadonly();

  addToast(data: Toast) {
    this.toastSignal.update((toasts) => [...toasts, data]);
    new Promise<number>((resolve) => {
      const timeout = setTimeout(() => {
        this.toastSignal.update((toasts) => toasts.filter((t) => t.id !== data.id));
        resolve(timeout);
      }, data.duration ?? 3000);
    })
      .then((timeout) => clearTimeout(timeout))
      .catch(noop);
  }
}
