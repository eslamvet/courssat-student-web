import { effect, inject, Injectable, signal } from '@angular/core';
import { Coupon } from '@models/coupon';
import { Course } from '@models/course';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSignal = signal<{ items: Partial<Course>[]; coupon: Coupon | null }>({
    items: JSON.parse(localStorage.getItem('cart-items') ?? '[]'),
    coupon: null,
  });
  readonly cart = this.cartSignal.asReadonly();
  private toastService = inject(ToastService);

  constructor() {
    effect(() => {
      localStorage.setItem('cart-items', JSON.stringify(this.cartSignal().items));
    });
  }

  addToCart(data: Partial<Course>) {
    if (!this.cartSignal().items.find((c) => c.id == data.id)) {
      if (data.coupon && this.cartSignal().coupon) {
        this.toastService.addToast({
          id: Date.now(),
          type: 'info',
          title: 'تنبيه',
          message: 'انت لديك بالفعل كوبون فى السلة قم بالغائه من الكورس حتى يمكنك اضافته',
        });
      } else {
        this.cartSignal.update((c) => ({
          ...c,
          items: [data, ...c.items],
          ...(data.coupon && data.coupon.coboneType !== 2 && { coupon: data.coupon }),
        }));
        this.toastService.addToast({
          id: Date.now(),
          type: 'success',
          title: `تم اضافة ${data.packageId ? 'الباقه' : 'الكورس'} بنجاح`,
          iconClass: 'solar--cart-check-outline',
        });
      }
    } else {
      this.toastService.addToast({
        id: Date.now(),
        type: 'info',
        title: 'تنبيه',
        message: `${data.packageId ? 'الباقه موجوده' : 'الكورس موجود'} بالفعل فى السلة`,
      });
    }
  }

  setCart(data: { items: Partial<Course>[]; coupon: Coupon | null }) {
    this.cartSignal.set(data);
  }

  updateCart(
    cb: (value: { items: Partial<Course>[]; coupon: Coupon | null }) => {
      items: Partial<Course>[];
      coupon: Coupon | null;
    }
  ) {
    this.cartSignal.update(cb);
  }
}
