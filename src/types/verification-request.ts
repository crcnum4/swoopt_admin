export type VerificationType = 'verified' | 'insured' | 'licensed';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequest {
  _id: string;
  orgId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedByUserId: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
