export type AuditTargetType = 'User' | 'Organization' | 'ServiceRequest' | 'Offer' | 'Transaction' | 'VerificationRequest';

export interface AdminAuditLog {
  _id: string;
  adminId: string;
  action: string;
  targetType: AuditTargetType;
  targetId: string;
  details: Record<string, unknown> | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
