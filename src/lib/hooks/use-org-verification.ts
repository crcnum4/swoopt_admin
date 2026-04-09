import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface VerifyParams {
  verified?: boolean;
  insured?: boolean;
  licensed?: boolean;
}

export function useOrgVerification(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VerifyParams) => {
      const { data, error } = await api.put(
        `/admin/organizations/${orgId}/verify`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to update verification');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'detail', orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'list'] });
    },
  });
}
