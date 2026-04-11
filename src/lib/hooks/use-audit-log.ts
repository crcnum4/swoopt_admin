import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminAuditLog } from '@/types/audit-log';

interface UseAuditLogParams {
  action?: string | null;
  targetType?: string | null;
}

interface AuditLogResponse {
  auditLogs: AdminAuditLog[];
}

export function useAuditLog({ action = null, targetType = null }: UseAuditLogParams = {}) {
  return useInfiniteQuery({
    queryKey: ['audit-log', 'list', action, targetType],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (action) params.set('action', action);
      if (targetType) params.set('targetType', targetType);
      if (pageParam) params.set('cursor', pageParam);

      const { data, meta, error } = await api.getPaginated<AuditLogResponse>(
        `/admin/audit-log?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch audit log');
      return { auditLogs: data.auditLogs, meta };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
  });
}
