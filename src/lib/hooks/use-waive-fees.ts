import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface WaiveParams {
  reason: string;
}

export function useWaiveFees(txId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: WaiveParams) => {
      const { data, error } = await api.put(
        `/admin/transactions/${txId}/waive-fees`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to waive fees');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
