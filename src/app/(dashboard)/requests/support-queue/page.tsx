'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupportQueue } from '@/lib/hooks/use-support-queue';
import { DataTable, type Column } from '@/components/data/data-table';
import { AgeBadge } from '@/components/data/age-badge';
import { truncateId } from '@/lib/utils';
import type { ServiceRequest } from '@/types/service-request';

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
    key: 'location',
    header: 'Location',
    render: (row) => (
      <span className="text-xs text-gray-500">
        {row.location?.address?.city || row.location?.label || '—'}
      </span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'age',
    header: 'Age',
    render: (row) => <AgeBadge createdAt={row.createdAt} />,
  },
  {
    key: 'attempts',
    header: 'Waves',
    render: (row) => (
      <span className="text-xs text-gray-600 font-medium">{row.currentWave}</span>
    ),
    hideOnMobile: true,
  },
  {
    key: 'actions',
    header: '',
    render: (row) => (
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          href={`/requests/${row._id}/find-provider`}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          Find Provider
        </Link>
        <Link
          href={`/requests/${row._id}`}
          className="rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          View
        </Link>
      </div>
    ),
  },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: '#6FFFE920' }}
      >
        <svg
          width={32} height={32} viewBox="0 0 24 24" fill="none"
          stroke="#6FFFE9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <p className="text-lg font-medium" style={{ color: '#4B3F72' }}>
        No exhausted requests
      </p>
      <p className="mt-1 text-sm text-gray-500">All caught up!</p>
    </div>
  );
}

export default function SupportQueuePage() {
  const router = useRouter();
  const { data: requests, isLoading, isError, error, refetch } = useSupportQueue();

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Support Queue</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load support queue</p>
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

  const count = requests?.length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Support Queue</h1>
        {count > 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-sm font-bold text-white"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            {count}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Exhausted requests requiring manual intervention — sorted by urgency
      </p>

      <div className="mt-6">
        {!isLoading && count === 0 ? (
          <EmptyState />
        ) : (
          <DataTable
            columns={columns}
            data={requests ?? []}
            loading={isLoading}
            skeletonRows={3}
            emptyMessage="No exhausted requests"
            onRowClick={(row) => router.push(`/requests/${row._id}`)}
          />
        )}
      </div>
    </div>
  );
}
