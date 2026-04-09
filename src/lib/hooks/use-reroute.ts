import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface RerouteParams {
  clearExclusions: boolean;
}

export function useReroute(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RerouteParams) => {
      const { data, error } = await api.post(
        `/admin/service-requests/${requestId}/re-route`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to re-route request');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}
