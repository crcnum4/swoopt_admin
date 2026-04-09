'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceRequests } from '@/lib/hooks/use-service-requests';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { FilterTabs } from '@/components/data/filter-tabs';
import { SearchInput } from '@/components/data/search-input';
import { truncateId, formatRelativeTime } from '@/lib/utils';
import type { ServiceRequest } from '@/types/service-request';

type StatusGroup = 'active' | 'history' | 'drafts' | 'pending' | 'exhausted' | null;

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'exhausted', label: 'Exhausted' },
  { key: 'pending', label: 'Pending' },
  { key: 'history', label: 'History' },
  { key: 'drafts', label: 'Drafts' },
];

const columns: Column<ServiceRequest>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => (
      <span className="font-mono text-xs text-gray-600">{truncateId(row._id)}</span>
    ),
  },
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <span className="text-xs text-gray-700">{truncateId(row.userId, 12)}</span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'service',
    header: 'Service',
    render: (row) => (
      <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>
        {row.parsedIntent?.serviceType || 'Unknown'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'created',
    header: 'Created',
    render: (row) => (
      <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'distance',
    header: 'Distance',
    render: (row) => (
      <span className="text-xs text-gray-500">
        {row.maxDistanceMiles ? `${row.maxDistanceMiles} mi` : '—'}
      </span>
    ),
    hideOnMobile: true,
  },
];

export default function RequestsPage() {
  const router = useRouter();
  const [statusGroup, setStatusGroup] = useState<StatusGroup>(null);
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
  } = useServiceRequests({
    statusGroup,
    search,
  });

  const allRequests = data?.pages.flatMap((p) => p.serviceRequests) ?? [];

  const handleTabChange = useCallback((key: string) => {
    setStatusGroup(key === 'all' ? null : (key as StatusGroup));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Service Requests</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load requests</p>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Service Requests</h1>
      <p className="mt-1 text-sm text-gray-500">
        All platform service requests
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          tabs={STATUS_TABS}
          activeKey={statusGroup ?? 'all'}
          onChange={handleTabChange}
        />
        <div className="w-full sm:w-64">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Search requests…"
          />
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={allRequests}
          loading={isLoading}
          emptyMessage="No requests found"
          onRowClick={(row) => router.push(`/requests/${row._id}`)}
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
            ) : allRequests.length > 0 ? (
              <p className="text-center text-xs text-gray-400">All requests loaded</p>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
