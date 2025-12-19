import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnChanges,
  Renderer2,
  signal,
  SimpleChanges,
  viewChild,
} from '@angular/core';
import { PAYMENTMETHOD, PRODUCTTYPE } from '@models/CoursePurchase';
import { OrderService } from '@services/order-service';
import { ToastService } from '@services/toast-service';
import { UserService } from '@services/user-service';
import { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { FAWATEERK_SCRIPT_URL, TABBY_SCRIPT_URL } from '@utils/constants';
import { generateOrderBody, getUserCountry, loadScriptWithRetries } from '@utils/helpers';
import { injectStripe, StripeElementsDirective, StripePaymentElementComponent } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { Fawaterk } from '@directives/fawaterk';
import { Course } from '@models/course';
import { CurrencyService } from '@services/currency-service';
import { finalize, iif, switchMap, throwError } from 'rxjs';
import { CartService } from '@services/cart-service';
import { Router } from '@angular/router';
import { IPayPalConfig, NgxPayPalModule } from 'ngx-paypal';
declare var fawaterkCheckout: any;
declare var CardSDK: any;

@Component({
  selector: 'app-payment-methods',
  imports: [StripeElementsDirective, StripePaymentElementComponent, Fawaterk, NgxPayPalModule],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OrderService],
})
export class PaymentMethods implements OnChanges {
  totalValue = input.required<number>();
  totalOriginalValue = input.required<number>();
  courses = input.required<Partial<Course>[]>();
  couponId = input<number>();
  customPaymentBtnClass = input<string>();
  fromCart = input<boolean>();
  stripe = injectStripe(environment.stripeKey);
  orderService = inject(OrderService);
  cartService = inject(CartService);
  toastService = inject(ToastService);
  currency = inject(CurrencyService).currency();
  user = inject(UserService).user();
  renderer = inject(Renderer2);
  ngZone = inject(NgZone);
  router = inject(Router);
  paymentElement = viewChild(StripePaymentElementComponent);
  tapContainerElement = viewChild<ElementRef<HTMLDivElement>>('tapContainer');
  elementsOptions = signal<StripeElementsOptions>({
    locale: 'ar',
    appearance: {
      theme: 'stripe',
      labels: 'above',
      variables: {
        colorPrimary: '#0a3e6e',
        fontFamily: 'STC, sans-serif',
      },
    },
  });
  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false,
    },
  };
  userCountry = getUserCountry();
  PAYMENTMETHOD = PAYMENTMETHOD;
  loadingPaymentMethod = signal<boolean>(false);
  isPaying = signal<boolean>(false);
  isTappyInstallmentPayment = signal<boolean>(false);
  selectedPaymentMethod = signal<(typeof PAYMENTMETHOD)[keyof typeof PAYMENTMETHOD] | null>(null);
  payPalConfig: IPayPalConfig = {
    currency: 'USD',
    clientId: environment.paypalClientId,
    createOrderOnClient: () => ({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: this.totalValue().toString(),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: this.totalValue().toString(),
              },
            },
          },
          items: this.courses().map((c) => ({
            name: c.courseName_AR!,
            quantity: '1',
            unit_amount: {
              currency_code: 'USD',
              value: c.discountPrice?.toString()!,
            },
          })),
        },
      ],
    }),
    advanced: {
      commit: 'true',
      extraQueryParams: [{ name: 'disable-funding', value: 'credit,card' }],
    },
    style: {
      label: 'paypal',
      layout: 'vertical',
      height: 55,
    },
    onApprove: (data, actions) => {},
    onClientAuthorization: () => {
      if (this.isPaying()) return;
      this.isPaying.set(true);
      this.orderService
        .createOrder(
          this.user!,
          this.totalValue(),
          this.totalOriginalValue(),
          this.courses(),
          this.couponId()
        )
        .subscribe({
          next: () => {
            this.fromCart() && this.cartService.setCart({ items: [], coupon: null });
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
    },
    onCancel: () => {
      this.toastService.addToast({
        id: Date.now(),
        type: 'info',
        title: 'تم الغاء عمليه الدفع',
      });
    },
    onError: (error) => {
      this.toastService.addToast({
        id: Date.now(),
        type: 'error',
        title: 'حدث خطا ما',
        message: error.message,
      });
    },
    onClick: (data, actions: any) => {},
  };

  constructor() {
    effect(() => {
      this.tapContainerElement() && this.initiateTapPaymentHandler();
    });
    window.addEventListener('message', this.onMessageHandler.bind(this));

    // setTimeout(() => {
    //   const paymentRequest = this.stripe.paymentRequest({
    //     country: 'GB',
    //     currency: 'usd',
    //     total: {
    //       label: 'Demo Product',
    //       amount: 1000, // $50
    //     },
    //     requestPayerName: true,
    //     requestPayerEmail: true,
    //   });

    //   // Check Apple Pay / Google Pay availability
    //   paymentRequest.canMakePayment().then((result) => {
    //     if (result) {
    //       console.log('Apple Pay or Google Pay is available:', result);
    //     } else {
    //       console.warn('Apple Pay or Google Pay not available');
    //     }
    //   });
    // }, 5000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes['totalValue'].firstChange &&
      changes['totalValue'].currentValue !== changes['totalValue'].previousValue
    ) {
      this.selectedPaymentMethod.set(null);
      this.payPalConfig = {
        ...this.payPalConfig,
        createOrderOnClient: () => ({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: changes['totalValue'].currentValue.toString(),
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: changes['totalValue'].currentValue.toString(),
                  },
                },
              },
              items: this.courses().map((c) => ({
                name: c.courseName_AR!,
                quantity: '1',
                unit_amount: {
                  currency_code: 'USD',
                  value: c.discountPrice?.toString()!,
                },
              })),
            },
          ],
        }),
      };
    }
  }

  getStripePaymentIntentHandler() {
    if (this.isPaying()) return;
    this.selectedPaymentMethod.set(PAYMENTMETHOD.STRIPE);
    this.loadingPaymentMethod.set(true);
    this.orderService
      .createStripePaymentIntent({
        amount: this.totalValue() * 100,
        currency: 'usd',
        cardsOnly: true,
      })
      .subscribe({
        next: ({ clientSecret }) => {
          this.elementsOptions.update((options) => ({ ...options, clientSecret, mode: undefined }));
          this.loadingPaymentMethod.set(false);
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

  loadFawaterkPaymentMethodHandler() {
    if (this.isPaying()) return;
    this.selectedPaymentMethod.set(PAYMENTMETHOD.FAWATEERK);
    window.pluginConfig = {
      hashKey: environment.fawateerk_hash_key,
      envType: 'test',
      style: {
        listing: 'horizontal',
      },
      version: '0',
      requestBody: {
        cartTotal: Math.ceil(this.totalValue() * this.currency.value).toString(),
        currency: 'EGP',
        customer: {
          first_name: this.user?.firstName?.trim(),
          last_name: (this.user?.familyName || this.user?.firstName)?.trim(),
          email: this.user?.email,
          phone: '0123456789',
        },
        redirectionUrls: {
          successUrl: `${location.origin}/confirm-order?status=success`,
          failUrl: `${location.origin}/confirm-order?status=failed`,
          pendingUrl: `${location.origin}/confirm-order?status=pending`,
        },
        cartItems: this.courses().map((c) => ({
          name: c.courseName_AR,
          quantity: '1',
          price: Math.ceil(c.discountPrice! * this.currency.value).toString(),
        })),
        payLoad: {
          ...generateOrderBody(
            this.user!,
            this.totalValue(),
            this.totalOriginalValue(),
            this.courses(),
            this.couponId()
          ),
          fromCart: this.fromCart(),
          type: PRODUCTTYPE.COURSE,
        },
      },
    };
    if (typeof fawaterkCheckout === 'undefined') {
      this.loadingPaymentMethod.set(true);
      loadScriptWithRetries(FAWATEERK_SCRIPT_URL, this.renderer, (error) => {
        if (error) {
          this.toastService.addToast({
            id: Date.now(),
            type: 'error',
            title: 'حدث خطا ما',
            message: error.message,
          });
          return;
        }
        this.loadingPaymentMethod.set(false);
      });
    } else {
      this.loadingPaymentMethod.set(false);
    }
  }

  loadTappyPaymentMethodHandler() {
    if (this.isPaying()) return;
    this.selectedPaymentMethod.set(PAYMENTMETHOD.TAP);
    if (typeof CardSDK === 'undefined') {
      this.loadingPaymentMethod.set(true);
      loadScriptWithRetries(TABBY_SCRIPT_URL, this.renderer, (error) => {
        if (error) {
          this.toastService.addToast({
            id: Date.now(),
            type: 'error',
            title: 'حدث خطا ما',
            message: error.message,
          });
          return;
        }
        this.loadingPaymentMethod.set(false);
      });
    } else this.loadingPaymentMethod.set(false);
  }

  initiateTapPaymentHandler() {
    this.ngZone.runOutsideAngular(() => {
      const { renderTapCard, Theme, Currencies, Direction, Edges, Locale } = CardSDK;
      renderTapCard(this.tapContainerElement()?.nativeElement.id, {
        publicKey: environment.tap_public_key,
        merchant: {
          id: environment.tap_merchant_id,
        },
        transaction: {
          amount: Math.ceil(this.totalValue() * this.currency.value).toString(),
          currency: Currencies.SAR,
        },
        customer: {
          name: [
            {
              first: this.user?.firstName?.trim(),
              last: (this.user?.familyName || this.user?.firstName)?.trim(),
            },
          ],
          contact: {
            email: this.user?.email,
          },
        },
        acceptance: {
          supportedBrands: ['VISA', 'MASTERCARD', 'MADA'],
          supportedCards: 'ALL',
        },
        fields: {
          cardHolder: true,
        },
        addons: {
          displayPaymentBrands: true,
          loader: true,
        },
        interface: {
          locale: Locale.AR,
          theme: Theme.LIGHT,
          edges: Edges.CURVED,
          direction: Direction.RTL,
        },
        onReady: () => {},
        onSuccess: (data: any) => {
          this.isPaying.set(true);
          const orderData = generateOrderBody(
            this.user!,
            this.totalValue(),
            this.totalOriginalValue(),
            this.courses(),
            this.couponId()
          );
          this.orderService
            .createTapCharge({
              source: { id: data.id },
              customer: {
                email: this.user?.email!,
                first_name: this.user?.firstName?.trim()!,
                last_name: (this.user?.familyName || this.user?.firstName)?.trim()!,
              },
              currency: 'SAR',
              description: '',
              amount: (this.totalValue() * this.currency.value).toFixed(2),
              metadata: {
                ...orderData,
                paymentDetailVMs: JSON.stringify(orderData.paymentDetailVMs),
                fromCart: this.fromCart(),
                type: PRODUCTTYPE.COURSE,
                user_token: localStorage.getItem('courssat-user-token'),
              },
              post: {
                url: `${environment.secondServerUrl}/courssat-event/tap/charge-webhook`,
              },
            })
            .pipe(finalize(() => this.isPaying.set(false)))
            .subscribe({
              next: ({ data }) => {
                window.open(data.transaction.url, '_self');
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
        },
      });
    });
  }

  confirmTapPaymentHandler() {
    if (this.isPaying()) return;
    CardSDK.tokenize();
  }

  confirmTappyPaymentHandler() {
    if (this.isPaying()) return;
    this.isPaying.set(true);
    this.isTappyInstallmentPayment.set(true);
    const { Currencies } = CardSDK;
    const orderData = generateOrderBody(
      this.user!,
      this.totalValue(),
      this.totalOriginalValue(),
      this.courses(),
      this.couponId()
    );
    this.orderService
      .createTapCharge({
        source: { id: 'src_tabby.installement' },
        customer: {
          email: this.user?.email!,
          first_name: this.user?.firstName?.trim()!,
          last_name: (this.user?.familyName || this.user?.firstName)?.trim()!,
        },
        currency: Currencies.SAR,
        description: '',
        amount: Math.ceil(this.totalValue() * this.currency.value).toString(),
        metadata: {
          ...orderData,
          fromCart: this.fromCart(),
          type: PRODUCTTYPE.COURSE,
          paymentDetailVMs: JSON.stringify(orderData.paymentDetailVMs),
          user_token: localStorage.getItem('courssat-user-token'),
        },
        post: {
          url: `${environment.secondServerUrl}/courssat-event/tap/charge-webhook`,
        },
      })
      .pipe(
        finalize(() => {
          this.isPaying.set(false);
          this.isTappyInstallmentPayment.set(false);
        })
      )
      .subscribe({
        next: ({ data }) => {
          window.open(data.transaction.url, '_self');
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

  confirmStripePaymentHandler() {
    if (this.isPaying()) return;
    this.isPaying.set(true);
    this.paymentElement()?.elements.submit();
    this.stripe
      .confirmPayment({
        elements: this.paymentElement()?.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: this.user?.firstName + ' ' + this.user?.familyName,
              email: this.user?.email,
              address: {
                line1: 'Av. Ramon Nieto 313B 2D',
                postal_code: '36205',
                city: 'Vigo',
              },
            },
          },
        },
        redirect: 'if_required',
        clientSecret: this.elementsOptions().clientSecret!,
      })
      .pipe(
        switchMap((result) =>
          iif(
            () => !!result.error,
            throwError(() => new Error(result.error?.message ?? 'حدث خطا ما')),
            this.orderService.createOrder(
              this.user!,
              this.totalValue(),
              this.totalOriginalValue(),
              this.courses(),
              this.couponId()
            )
          )
        ),
        finalize(() => this.isPaying.set(false))
      )
      .subscribe({
        next: () => {
          this.fromCart() && this.cartService.setCart({ items: [], coupon: null });
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
  }

  initiateStripeApplePayHandler() {
    if (this.isPaying()) return;
    this.selectedPaymentMethod.set(PAYMENTMETHOD.STRIPE);
    this.loadingPaymentMethod.set(true);
    this.orderService
      .createStripePaymentIntent({
        amount: this.totalValue() * 100,
        currency: 'usd',
      })
      .subscribe({
        next: ({ clientSecret }) => {
          this.elementsOptions.update((options) => ({ ...options, clientSecret, mode: undefined }));
          this.loadingPaymentMethod.set(false);
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

  onMessageHandler(event: MessageEvent) {
    if (event.origin === location.origin && event.data.confirmOrder) {
      if (event.data.status == 'success') {
        if (this.isPaying()) return;
        this.isPaying.set(true);
        this.orderService
          .createOrder(
            this.user!,
            this.totalValue(),
            this.totalOriginalValue(),
            this.courses(),
            this.couponId()
          )
          .pipe(finalize(() => this.isPaying.set(false)))
          .subscribe({
            next: () => {
              this.fromCart() && this.cartService.setCart({ items: [], coupon: null });
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
      }
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessageHandler.bind(this));
  }
}
