import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ImgUrlPipe } from '@pipes/img-url-pipe';
import { SumPipe } from '@pipes/sum-pipe';
import { CartService } from '@services/cart-service';
import { CurrencyService } from '@services/currency-service';
import { getUserCountry } from '@utils/helpers';
import { PaymentMethods } from '@components/payment-methods/payment-methods';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [NgOptimizedImage, ImgUrlPipe, DecimalPipe, SumPipe, PaymentMethods, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  cartService = inject(CartService);
  currency = inject(CurrencyService).currency();
  isSaudi = getUserCountry() == 'SA';
  cartSignal = this.cartService.cart;

  removeCartItemHandler(index: number) {
    this.cartService.updateCart((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => index !== i),
    }));
  }

  resetCartHandler() {
    this.cartService.setCart({ coupon: null, items: [] });
  }
}
