import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { SumPipe } from '@pipes/sum-pipe';
import { CartService } from '@services/cart-service';
import { CurrencyService } from '@services/currency-service';
import { getUserCountry } from '@utils/helpers';
import { PaymentMethods } from '@components/payment-methods/payment-methods';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CouponService } from '@services/coupon-service';
import {
  catchError,
  concat,
  EMPTY,
  expand,
  firstValueFrom,
  iif,
  lastValueFrom,
  NEVER,
  of,
  switchMap,
} from 'rxjs';
import { ToastService } from '@services/toast-service';
import { OrderService } from '@services/order-service';
import { UserService } from '@services/user-service';
import { CertificateService } from '@services/certificate-service';

@Component({
  selector: 'app-cart',
  imports: [
    NgOptimizedImage,
    ImgUrlPipe,
    DecimalPipe,
    SumPipe,
    PaymentMethods,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  providers: [CouponService, OrderService, CertificateService],
})
export class Cart {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  userService = inject(UserService);
  toastService = inject(ToastService);
  router = inject(Router);
  currency = inject(CurrencyService).currency();
  isSaudi = getUserCountry() == 'SA';
  cartSignal = this.cartService.cart;
  couponLoading = signal(false);
  couponCode = new FormControl('', { nonNullable: true });
  couponService = inject(CouponService);

  removeCartItemHandler(index: number) {
    this.cartService.updateCart((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => index !== i),
    }));
  }

  async applyCouponHandler() {
    if (this.couponLoading()) return;
    this.couponLoading.set(true);
    if (this.cartSignal().coupon) {
      this.cartService.updateCart((prev) => ({
        ...prev,
        coupon: null,
        items: prev.items.map((c) => ({
          ...c,
          coupon: undefined,
          discountPrice: c.originalPrice,
          originalPrice: c.priceBeforeCoupon,
        })),
      }));
      return;
    }
    this.couponService
      .applyCoupon(this.couponCode.value, 0)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: async (coupon) => {
          if (coupon) {
            if (coupon.coboneType !== 2)
              this.cartService.updateCart((prev) => ({
                ...prev,
                coupon,
                items: prev.items.map((c) => {
                  if ([1, 3].includes(coupon.coboneType)) {
                    c.coupon = coupon;
                    c.priceBeforeCoupon = c.originalPrice;
                    c.originalPrice = c.discountPrice;
                    c.discountPrice =
                      coupon.coboneType == 1
                        ? c.discountPrice! - coupon.value
                        : +(c.discountPrice! - (c.discountPrice! / 100) * coupon.value).toFixed(2);
                  }
                  return c;
                }),
              }));
            else {
              this.toastService.addToast({
                id: Date.now(),
                type: 'info',
                title: 'تنبيه',
                message: 'هذا الكوبون متاح في صفحه الكورس فقط',
              });
            }
            this.couponLoading.set(false);
          } else {
            for (let index = 0; index <= this.cartSignal().items.length; index++) {
              try {
                const coupon = await firstValueFrom(
                  this.couponService.applyCoupon(
                    this.couponCode.value,
                    this.cartSignal().items[index].id
                  )
                );
                this.couponLoading.set(false);
                switch (coupon.coboneType) {
                  case 0:
                    this.orderService
                      .createOrder(
                        this.userService.user()!,
                        0,
                        this.cartSignal().items.reduce(
                          (acc, c) => (acc += (c.originalPrice || c.discountPrice)!),
                          0
                        ),
                        this.cartSignal().items.map((c) => ({ ...c, coupon })),
                        coupon.id
                      )
                      .subscribe({
                        next: () => {
                          this.cartService.setCart({ items: [], coupon: null });
                          this.toastService.addToast({
                            id: Date.now(),
                            type: 'success',
                            title: 'تم الشراء بنجاح',
                          });
                          this.router.navigate(['profile', 'my-courses']);
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
                    break;
                  case 1:
                    this.cartService.updateCart((prev) => ({
                      ...prev,
                      coupon,
                      items: prev.items.map((c, cIndex) =>
                        index === cIndex
                          ? {
                              ...c,
                              coupon,
                              priceBeforeCoupon: c.originalPrice,
                              originalPrice: c.discountPrice,
                              discountPrice: c.discountPrice! - coupon.value,
                            }
                          : c
                      ),
                    }));
                    break;
                  case 2:
                    this.toastService.addToast({
                      id: Date.now(),
                      type: 'info',
                      title: 'تنبيه',
                      message: 'هذا الكوبون متاح في صفحه الكورس فقط',
                    });
                    break;
                  case 3:
                    this.cartService.updateCart((prev) => ({
                      ...prev,
                      coupon,
                      items: prev.items.map((c, cIndex) =>
                        index === cIndex
                          ? {
                              ...c,
                              coupon,
                              priceBeforeCoupon: c.originalPrice,
                              originalPrice: c.discountPrice,
                              discountPrice: +(
                                c.discountPrice! -
                                (c.discountPrice! / 100) * coupon.value
                              ).toFixed(2),
                            }
                          : c
                      ),
                    }));
                    break;
                }
                break;
              } catch (error) {
                if (index === this.cartSignal().items.length) {
                  this.couponLoading.set(false);
                  this.toastService.addToast({
                    id: Date.now(),
                    type: 'error',
                    title: 'حدث خطا ما',
                    message: 'الكوبون غير صالح',
                  });
                }
              }
            }
          }
        },
      });
  }

  resetCartHandler() {
    this.cartService.setCart({ coupon: null, items: [] });
  }
}
