import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CreditParams {
  amountCents: number;
  reason: string;
}

export function useUserCredits(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreditParams) => {
      const { data, error } = await api.post(
        `/admin/users/${userId}/credits`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to issue credits');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
    },
  });
}
