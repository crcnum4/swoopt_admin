'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserDetail } from '@/lib/hooks/use-user-detail';
import { useUserBan } from '@/lib/hooks/use-user-ban';
import { useUserCredits } from '@/lib/hooks/use-user-credits';
import { useServiceRequests } from '@/lib/hooks/use-service-requests';
import { StatusBadge } from '@/components/data/status-badge';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useToast } from '@/components/data/toast';
import { formatCents, formatRelativeTime } from '@/lib/utils';
import type { ServiceRequest } from '@/types/service-request';

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <h2 className="text-sm font-semibold" style={{ color: '#4B3F72' }}>{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2">
      <span className="text-xs font-medium text-gray-500 sm:w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value || '—'}</span>
    </div>
  );
}

const requestColumns: Column<ServiceRequest>[] = [
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'service',
    header: 'Service',
    render: (row) => (
      <span className="text-sm" style={{ color: '#4B3F72' }}>
        {row.parsedIntent?.serviceType || 'Unknown'}
      </span>
    ),
  },
  {
    key: 'created',
    header: 'Created',
    render: (row) => <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>,
  },
];

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { data: user, isLoading, isError, error, refetch } = useUserDetail(userId);
  const ban = useUserBan(userId);
  const credits = useUserCredits(userId);
  const { toast } = useToast();

  const { data: requestsData, isLoading: requestsLoading } = useServiceRequests({ userId });
  const userRequests = requestsData?.pages.flatMap((p) => p.serviceRequests) ?? [];

  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  const handleBanToggle = () => {
    if (!user) return;
    if (user.banned) {
      // Unban immediately with confirmation
      ban.mutate({ banned: false }, {
        onSuccess: () => { toast('User unbanned', 'success'); },
        onError: (err) => toast(err.message, 'error'),
      });
    } else {
      setBanDialogOpen(true);
    }
  };

  const confirmBan = () => {
    if (!banReason.trim()) return;
    ban.mutate({ banned: true, reason: banReason.trim() }, {
      onSuccess: () => { toast('User banned', 'info'); setBanDialogOpen(false); setBanReason(''); },
      onError: (err) => toast(err.message, 'error'),
    });
  };

  const handleIssueCredits = () => {
    const amountDollars = parseFloat(creditAmount);
    if (!amountDollars || amountDollars <= 0 || !creditReason.trim()) return;
    credits.mutate({ amountCents: Math.round(amountDollars * 100), reason: creditReason.trim() }, {
      onSuccess: () => {
        toast(`${formatCents(Math.round(amountDollars * 100))} credits issued`, 'success');
        setCreditAmount('');
        setCreditReason('');
      },
      onError: (err) => toast(err.message, 'error'),
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />)}
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>User Detail</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load user</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/users" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#4B3F72' }}>
          ← Back to Users
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>{user.email}</h1>
          {user.banned && (
            <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: '#FF6B6B15', color: '#FF6B6B' }}>Banned</span>
          )}
          {user.platformAdmin && (
            <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">Admin</span>
          )}
        </div>
      </div>

      {/* User Info */}
      <SectionCard title="User Info">
        <div className="divide-y divide-gray-100">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Email Verified" value={user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toLocaleDateString() : 'No'} />
          <InfoRow label="Platform Admin" value={user.platformAdmin ? 'Yes' : 'No'} />
          <InfoRow label="Credit Balance" value={<span className="font-semibold" style={{ color: '#4B3F72' }}>{formatCents(user.creditBalanceCents ?? 0)}</span>} />
          <InfoRow label="Rating" value={
            user.ratingStats?.currentRating && user.ratingStats.currentRating > 0
              ? `★ ${user.ratingStats.currentRating.toFixed(1)} (${user.ratingStats.totalRatings} ratings)`
              : 'No ratings'
          } />
          {user.createdByAdmin && <InfoRow label="Created By Admin" value={<span className="font-mono text-xs">{user.createdByAdmin}</span>} />}
          <InfoRow label="Created" value={formatRelativeTime(user.createdAt)} />
        </div>
      </SectionCard>

      {/* Ban / Unban */}
      <SectionCard title="Account Status">
        {user.banned ? (
          <div>
            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: '#FF6B6B08', borderColor: '#FF6B6B40' }}>
              <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>This user is banned</p>
              {user.banReason && <p className="text-xs text-gray-500 mt-1">Reason: {user.banReason}</p>}
            </div>
            <button
              onClick={handleBanToggle}
              disabled={ban.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#0D7377' }}
            >
              {ban.isPending ? 'Unbanning…' : 'Unban User'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleBanToggle}
            disabled={ban.isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            Ban User
          </button>
        )}
      </SectionCard>

      {/* Credits */}
      <SectionCard title="Issue Credits">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="5.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex-[2]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Reason *</label>
            <input
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="Goodwill credit for delayed service"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleIssueCredits}
              disabled={!creditAmount || !creditReason.trim() || credits.isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: '#4B3F72' }}
            >
              {credits.isPending ? 'Issuing…' : 'Issue Credits'}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Request History */}
      <SectionCard title="Request History">
        <DataTable
          columns={requestColumns}
          data={userRequests}
          loading={requestsLoading}
          skeletonRows={3}
          emptyMessage="No service requests"
          onRowClick={(row) => router.push(`/requests/${row._id}`)}
        />
      </SectionCard>

      {/* Ban Dialog */}
      <ConfirmDialog
        open={banDialogOpen}
        title="Ban User"
        description={`Ban ${user.email}? They will be unable to use the platform.`}
        confirmLabel="Ban User"
        confirmColor="#FF6B6B"
        loading={ban.isPending}
        onConfirm={confirmBan}
        onCancel={() => { setBanDialogOpen(false); setBanReason(''); }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Reason (required)</label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason for banning this user…"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {!banReason.trim() && (
            <p className="text-xs mt-1" style={{ color: '#FF6B6B' }}>Reason is required</p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
