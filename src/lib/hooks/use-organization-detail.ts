import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Organization } from '@/types/organization';

interface OrgDetailResponse {
  organization: Organization;
}

export function useOrganizationDetail(orgId: string) {
  return useQuery({
    queryKey: ['organizations', 'detail', orgId],
    queryFn: async () => {
      // The admin list endpoint doesn't have a dedicated detail route,
      // so we fetch by filtering the list with the org ID.
      // If a dedicated GET /admin/organizations/:orgId exists, use that instead.
      const { data, error } = await api.get<OrgDetailResponse>(
        `/admin/organizations/${orgId}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch organization');
      return data.organization;
    },
    enabled: !!orgId,
  });
}
