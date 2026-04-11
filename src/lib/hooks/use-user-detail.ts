import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types/user';

interface UserDetailResponse {
  user: User;
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ['users', 'detail', userId],
    queryFn: async () => {
      const { data, error } = await api.get<UserDetailResponse>(
        `/admin/users/${userId}`,
      );
      if (error || !data) throw new Error(error || 'Failed to fetch user');
      return data.user;
    },
    enabled: !!userId,
  });
}
