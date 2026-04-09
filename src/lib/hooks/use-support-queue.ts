import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServiceRequest } from '@/types/service-request';

interface SupportQueueResponse {
  serviceRequests: ServiceRequest[];
}

export function useSupportQueue() {
  return useQuery({
    queryKey: ['service-requests', 'support-queue'],
    queryFn: async () => {
      const { data, error } = await api.get<SupportQueueResponse>(
        '/admin/service-requests?status=exhausted&limit=50',
      );
      if (error || !data) throw new Error(error || 'Failed to fetch support queue');
      // Sort oldest-first (most urgent at top)
      return data.serviceRequests.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
    refetchInterval: 15_000,
  });
}
