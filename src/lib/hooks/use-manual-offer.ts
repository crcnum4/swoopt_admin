import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ManualOfferParams {
  orgId: string;
  serviceItemId?: string;
  priceCents?: number;
  startTime?: string;
  note?: string;
}

export function useManualOffer(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ManualOfferParams) => {
      const { data, error } = await api.post(
        `/admin/service-requests/${requestId}/manual-offer`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to send manual offer');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}
