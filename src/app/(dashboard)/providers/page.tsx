'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizations } from '@/lib/hooks/use-organizations';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { FilterTabs } from '@/components/data/filter-tabs';
import { SearchInput } from '@/components/data/search-input';
import type { Organization, OrgStatus } from '@/types/organization';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'pending_verification', label: 'Pending' },
  { key: 'blocked', label: 'Blocked' },
];

const columns: Column<Organization>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>{row.name}</span>
    ),
  },
  {
    key: 'industry',
    header: 'Industry',
    render: (row) => (
      <span className="text-xs text-gray-600">{row.industryId || '—'}</span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'verification',
    header: 'Verification',
    render: (row) => (
      <div className="flex gap-1">
        {row.verification?.verified && (
          <span className="inline-flex rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">V</span>
        )}
        {row.verification?.insured && (
          <span className="inline-flex rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">I</span>
        )}
        {row.verification?.licensed && (
          <span className="inline-flex rounded-full bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">L</span>
        )}
        {!row.verification?.verified && !row.verification?.insured && !row.verification?.licensed && (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </div>
    ),
    hideOnMobile: true,
  },
  {
    key: 'rating',
    header: 'Rating',
    render: (row) => (
      <span className="text-xs text-gray-700">
        {row.currentRating > 0
          ? `★ ${row.currentRating.toFixed(1)} (${row.totalRatings})`
          : '—'}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'available',
    header: 'Available',
    render: (row) => (
      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${row.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
    ),
  },
];

export default function ProvidersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OrgStatus | null>(null);
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useOrganizations({ status, search });

  const allOrgs = data?.pages.flatMap((p) => p.organizations) ?? [];

  const handleTabChange = useCallback((key: string) => {
    setStatus(key === 'all' ? null : (key as OrgStatus));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Providers</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load organizations</p>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Providers</h1>
      <p className="mt-1 text-sm text-gray-500">All platform organizations</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={STATUS_TABS}
          activeKey={status ?? 'all'}
          onChange={handleTabChange}
        />
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search providers…"
          />
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={allOrgs}
          loading={isLoading}
          emptyMessage="No organizations found"
          onRowClick={(row) => router.push(`/providers/${row._id}`)}
          footer={
            hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full text-center text-sm font-medium py-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ color: '#4B3F72' }}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load More'}
              </button>
            ) : allOrgs.length > 0 ? (
              <p className="text-center text-xs text-gray-400">All organizations loaded</p>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
