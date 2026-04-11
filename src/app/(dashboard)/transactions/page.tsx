'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { useWaiveFees } from '@/lib/hooks/use-waive-fees';
import { DataTable, type Column } from '@/components/data/data-table';
import { StatusBadge } from '@/components/data/status-badge';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useToast } from '@/components/data/toast';
import { truncateId, formatCents, formatRelativeTime, displayRef } from '@/lib/utils';
import type { Transaction, TransactionType, TransactionStatus, PayoutStatus } from '@/types/transaction';

const TYPE_OPTIONS: { value: TransactionType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'standard', label: 'Standard' },
  { value: 'medical_hold', label: 'Medical Hold' },
  { value: 'legal_exempt', label: 'Legal Exempt' },
];

const STATUS_OPTIONS: { value: TransactionStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'hold', label: 'Hold' },
  { value: 'charged', label: 'Charged' },
  { value: 'partially_refunded', label: 'Partial Refund' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

const PAYOUT_OPTIONS: { value: PayoutStatus | ''; label: string }[] = [
  { value: '', label: 'All Payouts' },
  { value: 'held', label: 'Held' },
  { value: 'claimable', label: 'Claimable' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

const columns: Column<Transaction>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (row) => <span className="font-mono text-xs text-gray-600">{truncateId(row._id)}</span>,
  },
  {
    key: 'user',
    header: 'User',
    render: (row) => <span className="text-xs text-gray-700">{displayRef(row.userId as string, 'email')}</span>,
    hideOnMobile: true,
  },
  {
    key: 'org',
    header: 'Provider',
    render: (row) => <span className="text-xs text-gray-700">{displayRef(row.orgId as string, 'name')}</span>,
    hideOnMobile: true,
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => <StatusBadge status={row.type} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (row) => <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>{formatCents(row.totalChargedCents)}</span>,
  },
  {
    key: 'fee',
    header: 'Fee',
    render: (row) => <span className="text-xs text-gray-600">{formatCents(row.platformFeeCents)}</span>,
    hideOnMobile: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: 'payout',
    header: 'Payout',
    render: (row) => <StatusBadge status={row.payoutStatus} />,
    hideOnMobile: true,
  },
  {
    key: 'date',
    header: 'Date',
    render: (row) => <span className="text-xs text-gray-500">{formatRelativeTime(row.createdAt)}</span>,
    hideOnMobile: true,
  },
];

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | null>(null);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | null>(null);
  const [payoutFilter, setPayoutFilter] = useState<PayoutStatus | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
  const [waiveReason, setWaiveReason] = useState('');
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useTransactions({ type: typeFilter, status: statusFilter, payoutStatus: payoutFilter });

  const allTx = data?.pages.flatMap((p) => p.transactions) ?? [];

  const waiveFees = useWaiveFees(selectedTx?._id ?? '');

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(selectedTx?._id === tx._id ? null : tx);
  };

  const handleWaive = () => {
    if (!waiveReason.trim()) return;
    waiveFees.mutate({ reason: waiveReason.trim() }, {
      onSuccess: () => {
        toast('Fees waived', 'success');
        setWaiveDialogOpen(false);
        setWaiveReason('');
        setSelectedTx(null);
      },
      onError: (err) => toast(err.message, 'error'),
    });
  };

  const selectClass = "rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400";

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Transactions</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load transactions</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Transactions</h1>
      <p className="mt-1 text-sm text-gray-500">Platform payment tracking</p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select value={typeFilter ?? ''} onChange={(e) => setTypeFilter(e.target.value as TransactionType || null)} className={selectClass}>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={statusFilter ?? ''} onChange={(e) => setStatusFilter(e.target.value as TransactionStatus || null)} className={selectClass}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={payoutFilter ?? ''} onChange={(e) => setPayoutFilter(e.target.value as PayoutStatus || null)} className={selectClass}>
          {PAYOUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={allTx}
          loading={isLoading}
          emptyMessage="No transactions found"
          onRowClick={handleRowClick}
          rowClassName={(row) => selectedTx?._id === row._id ? 'bg-indigo-50' : ''}
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
            ) : allTx.length > 0 ? (
              <p className="text-center text-xs text-gray-400">All transactions loaded</p>
            ) : undefined
          }
        />
      </div>

      {/* Expanded detail panel */}
      {selectedTx && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#4B3F72' }}>Transaction Detail</h3>
            <button onClick={() => setSelectedTx(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0">
            <div>
              <InfoRow label="Service Price" value={formatCents(selectedTx.servicePriceCents)} />
              <InfoRow label="Platform Fee" value={formatCents(selectedTx.platformFeeCents)} />
              {selectedTx.holdAmountCents != null && <InfoRow label="Hold Amount" value={formatCents(selectedTx.holdAmountCents)} />}
              <InfoRow label="Total Charged" value={<span className="font-semibold" style={{ color: '#4B3F72' }}>{formatCents(selectedTx.totalChargedCents)}</span>} />
              <InfoRow label="Refund" value={formatCents(selectedTx.refundAmountCents)} />
              <InfoRow label="Credits Issued" value={formatCents(selectedTx.creditIssuedCents)} />
            </div>
            <div>
              <InfoRow label="Payout Amount" value={formatCents(selectedTx.payoutAmountCents ?? 0)} />
              <InfoRow label="Payout Status" value={<StatusBadge status={selectedTx.payoutStatus} />} />
              <InfoRow label="Payment Provider" value={selectedTx.paymentProvider || '—'} />
              <InfoRow label="No-Show" value={selectedTx.noShow ? <span className="text-red-600 font-medium">Yes</span> : 'No'} />
              <InfoRow label="Created" value={new Date(selectedTx.createdAt).toLocaleString()} />
            </div>
          </div>
          {selectedTx.platformFeeCents > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setWaiveDialogOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Waive Fees
              </button>
            </div>
          )}
        </div>
      )}

      {/* Waive Dialog */}
      <ConfirmDialog
        open={waiveDialogOpen}
        title="Waive Platform Fees"
        description={selectedTx ? `Waive ${formatCents(selectedTx.platformFeeCents)} in fees for this transaction?` : ''}
        confirmLabel="Waive Fees"
        confirmColor="#FF6B6B"
        loading={waiveFees.isPending}
        onConfirm={handleWaive}
        onCancel={() => { setWaiveDialogOpen(false); setWaiveReason(''); }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Reason (required)</label>
          <textarea
            value={waiveReason}
            onChange={(e) => setWaiveReason(e.target.value)}
            placeholder="Reason for waiving fees…"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
