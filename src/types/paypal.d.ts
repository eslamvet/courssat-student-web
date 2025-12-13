export {};

declare global {
  interface Window {
    paypal: PayPalNamespace;
  }

  interface PayPalNamespace {
    Buttons(options: PayPalButtonsOptions): PayPalButtonsInstance;
  }

  interface PayPalButtonsInstance {
    render(container: string | HTMLElement): Promise<void>;
  }

  interface PayPalButtonsOptions {
    createOrder(
      data: unknown,
      actions: {
        order: {
          create(order: PayPalOrder): Promise<string>;
        };
      }
    ): Promise<string>;

    onApprove?(
      data: unknown,
      actions: {
        order: {
          capture(): Promise<PayPalCaptureDetails>;
        };
      }
    ): Promise<void>;

    onCancel?(): void;
    onError?(err: Error): void;
  }

  interface PayPalOrder {
    purchase_units: Array<{
      amount: {
        value: string;
        currency_code?: string;
      };
    }>;
  }

  interface PayPalCaptureDetails {
    id: string;
    status: string;
    payer?: unknown;
  }
}
