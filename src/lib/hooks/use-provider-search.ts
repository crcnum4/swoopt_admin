import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProviderSearchResult } from '@/types/organization';

interface ProviderSearchParams {
  lat: number | null;
  lng: number | null;
  radiusMiles: number;
  industryId?: string;
}

interface ProviderSearchResponse {
  providers: ProviderSearchResult[];
}

export function useProviderSearch({ lat, lng, radiusMiles, industryId }: ProviderSearchParams) {
  return useQuery({
    queryKey: ['providers', 'search', lat, lng, radiusMiles, industryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('lat', String(lat));
      params.set('lng', String(lng));
      params.set('radiusMiles', String(radiusMiles));
      if (industryId) params.set('industryId', industryId);

      const { data, error } = await api.get<ProviderSearchResponse>(
        `/admin/providers/search?${params.toString()}`,
      );
      if (error || !data) throw new Error(error || 'Failed to search providers');
      return data.providers;
    },
    enabled: lat !== null && lng !== null,
  });
}
