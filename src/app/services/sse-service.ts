import { effect, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from './user-service';
import { ToastService } from './toast-service';
import { CartService } from './cart-service';

@Injectable({
  providedIn: 'root',
})
export class SseService {
  user = inject(UserService).user;
  toastService = inject(ToastService);
  cartService = inject(CartService);
  router = inject(Router);
  private eventSource!: EventSource;

  constructor() {
    effect(() => {
      this.user() ? this.startConnection() : this.closeConnection();
    });
  }

  startConnection() {
    this.eventSource = new EventSource(
      `${environment.secondServerUrl}/courssat-event?userId=${
        this.user()?.id
      }&userToken=${localStorage.getItem('courssat-user-token')}`
    );
    this.eventSource.onmessage = (event) => {
      if (event.data) {
        const payload = JSON.parse(event.data);
        if (payload.error) {
          this.toastService.addToast({
            id: Date.now(),
            type: 'error',
            title: 'حدث خطا ما',
            message: 'لقد فشلت عمليه الدفع',
          });
        }
        if (payload.success) {
          this.toastService.addToast({
            id: Date.now(),
            type: 'success',
            title: 'تم الشراء بنجاح',
          });
          if (payload.coursesIds)
            this.cartService.updateCart((prev) => ({
              ...prev,
              items: prev.items.filter((c) => !payload.coursesIds.includes(c.id)),
              coupon:
                payload.couponId === prev.coupon?.id ||
                !prev.items.filter((c) => !payload.coursesIds.includes(c.id)).length
                  ? null
                  : prev.coupon,
            }));
          this.router.navigate(['profile', 'my-courses']);
        }
      }
    };
    this.eventSource.onerror = () => {
      this.eventSource.close();
    };
  }

  closeConnection() {
    this.eventSource?.close();
  }
}
