import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Organization, OrgStatus } from '@/types/organization';

interface UseOrganizationsParams {
  search?: string;
  status?: OrgStatus | null;
}

interface OrganizationsResponse {
  organizations: Organization[];
}

export function useOrganizations({ search = '', status = null }: UseOrganizationsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['organizations', 'list', status, search],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      if (pageParam) params.set('cursor', pageParam);

      const { data, meta, error } = await api.getPaginated<OrganizationsResponse>(
        `/admin/organizations?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch organizations');
      return { organizations: data.organizations, meta };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
  });
}
