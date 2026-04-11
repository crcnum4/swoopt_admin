import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServiceRequest, ServiceRequestStatus } from '@/types/service-request';
import { SERVICE_REQUEST_STATUS_GROUPS } from '@/types/service-request';

type StatusGroup = 'active' | 'history' | 'drafts' | 'pending' | 'exhausted' | null;

interface UseServiceRequestsParams {
  statusGroup?: StatusGroup;
  search?: string;
  userId?: string;
}

function getStatusParam(group: StatusGroup): string | undefined {
  if (!group) return undefined;
  if (group === 'exhausted') return 'exhausted';
  const statuses = SERVICE_REQUEST_STATUS_GROUPS[group as keyof typeof SERVICE_REQUEST_STATUS_GROUPS];
  if (!statuses) return undefined;
  return (statuses as readonly ServiceRequestStatus[]).join(',');
}

interface ServiceRequestsResponse {
  serviceRequests: ServiceRequest[];
}

export function useServiceRequests({ statusGroup = null, search = '', userId }: UseServiceRequestsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['service-requests', 'list', statusGroup, search, userId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      const statusParam = getStatusParam(statusGroup);
      if (statusParam) params.set('status', statusParam);
      if (search) params.set('search', search);
      if (userId) params.set('userId', userId);
      if (pageParam) params.set('cursor', pageParam);

      const { data, meta, error } = await api.getPaginated<ServiceRequestsResponse>(
        `/admin/service-requests?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch service requests');
      return { serviceRequests: data.serviceRequests, meta };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
  });
}
