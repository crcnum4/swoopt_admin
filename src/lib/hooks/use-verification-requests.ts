import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { VerificationRequest, VerificationStatus } from '@/types/verification-request';

interface VerificationRequestsResponse {
  verificationRequests: VerificationRequest[];
}

export function useVerificationRequests(status?: VerificationStatus | null) {
  return useQuery({
    queryKey: ['verification-requests', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);

      const { data, error } = await api.get<VerificationRequestsResponse>(
        `/admin/verification-requests?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch verification requests');
      return data.verificationRequests;
    },
  });
}
