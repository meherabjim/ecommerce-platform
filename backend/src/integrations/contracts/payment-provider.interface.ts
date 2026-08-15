export type PaymentIntentInput = {
  orderId: string;
  amount: number;
  currency: string;
  customer: {
    name: string;
    email?: string | null;
    phone: string;
  };
  returnUrl?: string;
  cancelUrl?: string;
};

export type PaymentIntentResult = {
  provider: string;
  externalReference: string;
  status: 'INITIATED' | 'PENDING' | 'PAID' | 'FAILED';
  redirectUrl?: string;
};

export interface PaymentProvider {
  readonly key: string;
  readonly displayName: string;
  isConfigured(): boolean;
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verify(reference: string): Promise<PaymentIntentResult>;
}
