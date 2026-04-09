import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServiceRequest } from '@/types/service-request';
import type { Offer } from '@/types/offer';
import type { Transaction } from '@/types/transaction';

interface ServiceRequestDetailResponse {
  serviceRequest: ServiceRequest;
  offers: Offer[];
  transaction: Transaction | null;
}

export function useServiceRequestDetail(requestId: string) {
  return useQuery({
    queryKey: ['service-requests', 'detail', requestId],
    queryFn: async () => {
      const { data, error } = await api.get<ServiceRequestDetailResponse>(
        `/admin/service-requests/${requestId}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch request detail');
      return data;
    },
    enabled: !!requestId,
  });
}
