import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BanParams {
  banned: boolean;
  reason?: string;
}

export function useUserBan(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BanParams) => {
      const { data, error } = await api.put(
        `/admin/users/${userId}/ban`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to update ban status');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
}
