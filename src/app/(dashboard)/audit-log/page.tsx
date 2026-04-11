'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuditLog } from '@/lib/hooks/use-audit-log';
import { DataTable, type Column } from '@/components/data/data-table';
import { truncateId, formatRelativeTime, displayRef } from '@/lib/utils';
import type { AdminAuditLog } from '@/types/audit-log';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'ban_user', label: 'Ban User' },
  { value: 'unban_user', label: 'Unban User' },
  { value: 'create_user', label: 'Create User' },
  { value: 'create_org', label: 'Create Org' },
  { value: 'issue_credits', label: 'Issue Credits' },
  { value: 'waive_fees', label: 'Waive Fees' },
  { value: 'verify_org', label: 'Verify Org' },
  { value: 'review_verification', label: 'Review Verification' },
  { value: 'reroute_request', label: 'Re-Route Request' },
  { value: 'manual_offer', label: 'Manual Offer' },
  { value: 'force_verify_email', label: 'Force Verify Email' },
  { value: 'force_password_reset', label: 'Force Password Reset' },
];

const TARGET_OPTIONS = [
  { value: '', label: 'All Targets' },
  { value: 'User', label: 'User' },
  { value: 'Organization', label: 'Organization' },
  { value: 'ServiceRequest', label: 'Service Request' },
  { value: 'Offer', label: 'Offer' },
  { value: 'Transaction', label: 'Transaction' },
  { value: 'VerificationRequest', label: 'Verification' },
];

function getTargetLink(targetType: string, targetId: string): string | null {
  switch (targetType) {
    case 'User': return `/users/${targetId}`;
    case 'Organization': return `/providers/${targetId}`;
    case 'ServiceRequest': return `/requests/${targetId}`;
    default: return null;
  }
}

const ACTION_LABELS: Record<string, string> = {
  ban_user: 'Ban User',
  unban_user: 'Unban User',
  create_user: 'Create User',
  create_org: 'Create Org',
  issue_credits: 'Issue Credits',
  waive_fees: 'Waive Fees',
  verify_org: 'Verify Org',
  review_verification: 'Review Verification',
  reroute_request: 'Re-Route',
  manual_offer: 'Manual Offer',
  force_verify_email: 'Force Verify',
  force_password_reset: 'Force Reset',
};

const columns: Column<AdminAuditLog>[] = [
  {
    key: 'date',
    header: 'Date',
    render: (row) => <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>,
  },
  {
    key: 'admin',
    header: 'Admin',
    render: (row) => <span className="text-xs text-gray-700">{displayRef(row.adminId as string, 'email')}</span>,
    hideOnMobile: true,
  },
  {
    key: 'action',
    header: 'Action',
    render: (row) => (
      <span
        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ backgroundColor: '#4B3F7215', color: '#4B3F72' }}
      >
        {ACTION_LABELS[row.action] || row.action}
      </span>
    ),
  },
  {
    key: 'target',
    header: 'Target',
    render: (row) => (
      <div className="text-xs">
        <span className="text-gray-500">{row.targetType}</span>
        {' '}
        {(() => {
          const link = getTargetLink(row.targetType, row.targetId);
          return link ? (
            <Link href={link} className="font-mono hover:underline" style={{ color: '#4B3F72' }} onClick={(e) => e.stopPropagation()}>
              {truncateId(row.targetId)}
            </Link>
          ) : (
            <span className="font-mono text-gray-600">{truncateId(row.targetId)}</span>
          );
        })()}
      </div>
    ),
  },
  {
    key: 'note',
    header: 'Notes',
    render: (row) => (
      <span className="text-xs text-gray-500 truncate max-w-[200px] inline-block">
        {row.note || '—'}
      </span>
    ),
    hideOnMobile: true,
  },
];

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [targetFilter, setTargetFilter] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAuditLog({ action: actionFilter, targetType: targetFilter });

  const allLogs = data?.pages.flatMap((p) => p.auditLogs) ?? [];
  const selectClass = "rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400";

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Audit Log</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load audit log</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Audit Log</h1>
      <p className="mt-1 text-sm text-gray-500">All admin actions across the platform</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select value={actionFilter ?? ''} onChange={(e) => setActionFilter(e.target.value || null)} className={selectClass}>
          {ACTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={targetFilter ?? ''} onChange={(e) => setTargetFilter(e.target.value || null)} className={selectClass}>
          {TARGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={allLogs}
          loading={isLoading}
          emptyMessage="No audit log entries"
          footer={
            hasNextPage ? (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full text-center text-sm font-medium py-1 hover:opacity-80 disabled:opacity-50"
                style={{ color: '#4B3F72' }}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load More'}
              </button>
            ) : allLogs.length > 0 ? (
              <p className="text-center text-xs text-gray-400">All entries loaded</p>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
