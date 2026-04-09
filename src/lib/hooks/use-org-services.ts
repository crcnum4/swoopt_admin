import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ServiceItem } from '@/types/service-item';

interface ServicesResponse {
  services: ServiceItem[];
}

export function useOrgServices(orgId: string) {
  return useQuery({
    queryKey: ['organizations', 'services', orgId],
    queryFn: async () => {
      // Requires platform admin to have org role bypass (crcnum4/swoopt_bun_api#128)
      const { data, error } = await api.get<ServicesResponse>(
        `/organizations/${orgId}/services`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch services');
      return data.services;
    },
    enabled: !!orgId,
    retry: false,
  });
}

interface AddServiceParams {
  name: string;
  startingPrice: number;
  estimatedDurationMinutes?: number | null;
  category?: string;
  description?: string;
  isAddon?: boolean;
  requiresConsultation?: boolean;
}

export function useAddService(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddServiceParams) => {
      const { data, error } = await api.post(
        `/organizations/${orgId}/services`,
        params,
      );
      if (error || !data) throw new Error(error || 'Failed to add service');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'services', orgId] });
    },
  });
}
