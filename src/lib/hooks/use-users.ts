import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types/user';

interface UseUsersParams {
  search?: string;
}

interface UsersResponse {
  users: User[];
}

export function useUsers({ search = '' }: UseUsersParams = {}) {
  return useInfiniteQuery({
    queryKey: ['users', 'list', search],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (pageParam) params.set('cursor', pageParam);

      const { data, meta, error } = await api.getPaginated<UsersResponse>(
        `/admin/users?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch users');
      return { users: data.users, meta };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.cursor : undefined,
  });
}
