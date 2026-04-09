export type TransactionType = 'standard' | 'medical_hold' | 'legal_exempt';

export type TransactionStatus = 'pending' | 'hold' | 'charged' | 'partially_refunded' | 'refunded' | 'failed';

export type PayoutStatus = 'held' | 'claimable' | 'pending' | 'processing' | 'completed' | 'failed';

export interface Transaction {
  _id: string;
  serviceRequestId: string;
  offerId: string;
  userId: string;
  orgId: string;
  type: TransactionType;
  platformFeeCents: number;
  servicePriceCents: number;
  holdAmountCents: number | null;
  totalChargedCents: number;
  refundAmountCents: number;
  creditIssuedCents: number;
  paymentProvider?: 'stripe' | 'paypal' | 'other';
  paymentIntentId?: string;
  status: TransactionStatus;
  payoutStatus: PayoutStatus;
  payoutAmountCents?: number;
  noShow: boolean;
  createdAt: string;
  updatedAt: string;
}
