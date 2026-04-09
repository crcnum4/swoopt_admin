import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServiceScanJob } from '@/types/service-scan';

interface ScanResponse {
  job: ServiceScanJob;
}

export function useServiceScan(orgId: string, jobId: string | null) {
  return useQuery({
    queryKey: ['service-scan', orgId, jobId],
    queryFn: async () => {
      const { data, error } = await api.get<ScanResponse>(
        `/organizations/${orgId}/service-scan/${jobId}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch scan status');
      return data.job;
    },
    enabled: !!orgId && !!jobId,
    // Wait 15s before first poll, then every 5s
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') return 5000;
      return false;
    },
    staleTime: 0,
  });
}
