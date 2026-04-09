'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useVerificationRequests } from '@/lib/hooks/use-verification-requests';
import { useReviewVerification } from '@/lib/hooks/use-review-verification';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { FilterTabs } from '@/components/data/filter-tabs';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useToast } from '@/components/data/toast';
import { formatRelativeTime, displayRef } from '@/lib/utils';
import type { VerificationRequest, VerificationStatus } from '@/types/verification-request';

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

export default function VerificationPage() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | null>('pending');
  const { data: requests, isLoading, isError, error, refetch } = useVerificationRequests(statusFilter);
  const { toast } = useToast();

  const [approving, setApproving] = useState<VerificationRequest | null>(null);
  const [rejecting, setRejecting] = useState<VerificationRequest | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // We need a dynamic hook for the selected request — use a wrapper component pattern
  // For simplicity, handle the mutation inline via api calls
  const handleApprove = async () => {
    if (!approving) return;
    try {
      const { error: apiError } = await (await import('@/lib/api')).api.put(
        `/admin/verification-requests/${approving._id}/review`,
        { decision: 'approved' },
      );
      if (apiError) throw new Error(apiError);
      toast('Verification approved', 'success');
      setApproving(null);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to approve', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejecting || !rejectNotes.trim()) return;
    try {
      const { error: apiError } = await (await import('@/lib/api')).api.put(
        `/admin/verification-requests/${rejecting._id}/review`,
        { decision: 'rejected', notes: rejectNotes.trim() },
      );
      if (apiError) throw new Error(apiError);
      toast('Verification rejected', 'info');
      setRejecting(null);
      setRejectNotes('');
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to reject', 'error');
    }
  };

  const columns: Column<VerificationRequest>[] = [
    {
      key: 'org',
      header: 'Organization',
      render: (row) => (
        <Link
          href={`/providers/${row.orgId}`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#4B3F72' }}
          onClick={(e) => e.stopPropagation()}
        >
          {displayRef(row.orgId as string, 'name')}
        </Link>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <StatusBadge status={row.type} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
      hideOnMobile: true,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (row) => (
        <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        if (row.status !== 'pending') {
          return row.notes ? (
            <span className="text-xs text-gray-400 italic">{row.notes}</span>
          ) : null;
        }
        return (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setApproving(row)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0D7377' }}
            >
              Approve
            </button>
            <button
              onClick={() => setRejecting(row)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Verification Queue</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load verification requests</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Verification Queue</h1>
      <p className="mt-1 text-sm text-gray-500">Review provider verification requests</p>

      <div className="mt-6">
        <FilterTabs
          tabs={STATUS_TABS}
          activeKey={statusFilter ?? 'all'}
          onChange={(key) => setStatusFilter(key === 'all' ? null : key as VerificationStatus)}
        />
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={requests ?? []}
          loading={isLoading}
          skeletonRows={3}
          emptyMessage={statusFilter === 'pending' ? 'No pending verification requests' : 'No verification requests found'}
        />
      </div>

      {/* Approve dialog */}
      <ConfirmDialog
        open={!!approving}
        title="Approve Verification"
        description={approving ? `Approve ${approving.type} verification for this organization?` : ''}
        confirmLabel="Approve"
        confirmColor="#0D7377"
        onConfirm={handleApprove}
        onCancel={() => setApproving(null)}
      />

      {/* Reject dialog */}
      <ConfirmDialog
        open={!!rejecting}
        title="Reject Verification"
        description={rejecting ? `Reject ${rejecting.type} verification for this organization?` : ''}
        confirmLabel="Reject"
        confirmColor="#FF6B6B"
        onConfirm={handleReject}
        onCancel={() => { setRejecting(null); setRejectNotes(''); }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes (required)</label>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Reason for rejection…"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {rejecting && !rejectNotes.trim() && (
            <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>Notes are required for rejection</p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
