import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data, error } = await api.get<DashboardStats>('/admin/dashboard/stats');
      if (error || !data) throw new Error(error || 'Failed to fetch stats');
      return data;
    },
    refetchInterval: 30_000,
  });
}
