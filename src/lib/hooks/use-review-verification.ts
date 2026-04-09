import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ReviewParams {
  decision: 'approved' | 'rejected';
  notes?: string;
}

export function useReviewVerification(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ReviewParams) => {
      const { data, error } = await api.put(
        `/admin/verification-requests/${requestId}/review`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to review verification');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
