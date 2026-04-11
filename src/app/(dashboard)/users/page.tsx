'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/lib/hooks/use-users';
import { DataTable, type Column } from '@/components/data/data-table';
import { SearchInput } from '@/components/data/search-input';
import { formatRelativeTime } from '@/lib/utils';
import type { User } from '@/types/user';

const columns: Column<User>[] = [
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>{row.email}</span>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (row) => <span className="text-xs text-gray-600">{row.phone || '—'}</span>,
    hideOnMobile: true,
  },
  {
    key: 'verified',
    header: 'Verified',
    render: (row) => (
      <span className={row.emailVerifiedAt ? 'text-green-600' : 'text-gray-400'}>
        {row.emailVerifiedAt ? '✓' : '—'}
      </span>
    ),
  },
  {
    key: 'admin',
    header: 'Admin',
    render: (row) => (
      row.platformAdmin ? (
        <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">Admin</span>
      ) : null
    ),
    hideOnMobile: true,
  },
  {
    key: 'banned',
    header: 'Status',
    render: (row) => (
      row.banned ? (
        <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: '#FF6B6B15', color: '#FF6B6B' }}>Banned</span>
      ) : (
        <span className="text-xs text-green-600">Active</span>
      )
    ),
  },
  {
    key: 'rating',
    header: 'Rating',
    render: (row) => (
      <span className="text-xs text-gray-700">
        {row.ratingStats?.currentRating && row.ratingStats.currentRating > 0
          ? `★ ${row.ratingStats.currentRating.toFixed(1)} (${row.ratingStats.totalRatings})`
          : '—'}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'created',
    header: 'Created',
    render: (row) => <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>,
    hideOnMobile: true,
  },
];

export default function UsersPage() {
  const router = useRouter();
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
  } = useUsers({ search });

  const allUsers = data?.pages.flatMap((p) => p.users) ?? [];

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Users</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load users</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Users</h1>
      <p className="mt-1 text-sm text-gray-500">All platform users</p>

      <div className="mt-6 w-full sm:w-64">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search by email…"
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={allUsers}
          loading={isLoading}
          emptyMessage="No users found"
          onRowClick={(row) => router.push(`/users/${row._id}`)}
          rowClassName={(row) => row.banned ? 'bg-red-50' : ''}
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
            ) : allUsers.length > 0 ? (
              <p className="text-center text-xs text-gray-400">All users loaded</p>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
