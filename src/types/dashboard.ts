import type { ServiceRequestStatus } from './service-request';

export interface DashboardStats {
  users: {
    total: number;
    banned: number;
    platformAdmins: number;
  };
  organizations: {
    total: number;
    verified: number;
    available: number;
  };
  serviceRequests: {
    total: number;
    byStatus: Record<ServiceRequestStatus, number>;
  };
  offers: {
    total: number;
  };
  transactions: {
    total: number;
  };
  revenue: {
    totalChargedCents: number;
    totalPlatformFeeCents: number;
    totalPayoutCents: number;
  };
}
