export type DenialType = 'provider' | 'user';

export interface DenialEvent {
  _id: string;
  type: DenialType;
  offerId: string;
  serviceRequestId: string;
  orgId?: string;
  userId?: string;
  reason: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
