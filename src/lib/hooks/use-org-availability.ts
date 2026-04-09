import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrgAvailability(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const { data, error } = await api.put(
        `/organizations/${orgId}/availability`,
        { isAvailable },
      );
      if (error || !data) throw new Error(error || 'Failed to update availability');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'detail', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'list'] });
    },
  });
}
