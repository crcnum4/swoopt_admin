'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useServiceRequestDetail } from '@/lib/hooks/use-service-request-detail';
import { StatusBadge } from '@/components/data/status-badge';
import { DataTable, type Column } from '@/components/data/data-table';
import { RerouteDialog } from '@/components/requests/reroute-dialog';
import { truncateId, formatRelativeTime, formatCents } from '@/lib/utils';
import type { RankedProvider } from '@/types/service-request';
import type { Offer } from '@/types/offer';

// Offer-specific color map
const OFFER_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  accepted_by_provider: { bg: '#6FFFE920', text: '#0D7377' },
  accepted_by_user: { bg: '#6FFFE920', text: '#0D7377' },
  completed: { bg: '#6FFFE920', text: '#0D7377' },
  denied_by_provider: { bg: '#FF6B6B15', text: '#FF6B6B' },
  denied_by_user: { bg: '#F3F4F6', text: '#6B7280' },
  more_data_requested: { bg: '#FEF3C7', text: '#D97706' },
  expired: { bg: '#F3F4F6', text: '#6B7280' },
  withdrawn: { bg: '#F3F4F6', text: '#6B7280' },
  not_selected: { bg: '#F3F4F6', text: '#6B7280' },
};

const providerColumns: Column<RankedProvider>[] = [
  {
    key: 'orgId',
    header: 'Org ID',
    render: (row) => <span className="font-mono text-xs text-gray-600">{truncateId(row.orgId)}</span>,
  },
  {
    key: 'matchScore',
    header: 'Match',
    render: (row) => (
      <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>
        {Math.round(row.matchScore * 100)}%
      </span>
    ),
  },
  {
    key: 'distance',
    header: 'Distance',
    render: (row) => <span className="text-xs text-gray-600">{row.distanceMiles.toFixed(1)} mi</span>,
    hideOnMobile: true,
  },
  {
    key: 'service',
    header: 'Service',
    render: (row) => <span className="text-xs text-gray-700">{row.recommendedService?.name || '—'}</span>,
    hideOnMobile: true,
  },
  {
    key: 'sent',
    header: 'Sent',
    render: (row) => (
      <span className={row.sent ? 'text-green-600' : 'text-gray-400'}>
        {row.sent ? '✓' : '—'}
      </span>
    ),
  },
];

const offerColumns: Column<Offer>[] = [
  {
    key: 'orgId',
    header: 'Org ID',
    render: (row) => <span className="font-mono text-xs text-gray-600">{truncateId(row.orgId)}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} colorMap={OFFER_COLORS} />,
  },
  {
    key: 'price',
    header: 'Price',
    render: (row) => (
      <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>
        {row.priceCents ? formatCents(row.priceCents) : '—'}
      </span>
    ),
  },
  {
    key: 'wave',
    header: 'Wave',
    render: (row) => <span className="text-xs text-gray-600">{row.wave}</span>,
    hideOnMobile: true,
  },
  {
    key: 'manual',
    header: 'Manual',
    render: (row) => (
      row.isManualOffer ? (
        <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">Manual</span>
      ) : <span className="text-gray-400">—</span>
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-3">
        <h2 className="text-sm font-semibold" style={{ color: '#4B3F72' }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2">
      <span className="text-xs font-medium text-gray-500 sm:w-32 shrink-0">{label}</span>
      <span className="text-sm text-gray-800">{value || '—'}</span>
    </div>
  );
}

export default function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { data, isLoading, isError, error, refetch } = useServiceRequestDetail(requestId);
  const [copied, setCopied] = useState(false);
  const [rerouteOpen, setRerouteOpen] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Request Detail</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load request</p>
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

  if (!data) return null;

  const { serviceRequest: req, offers, transaction } = data;
  const isExhausted = req.status === 'exhausted';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={req.status} />
            <span className="text-xs text-gray-400">{formatRelativeTime(req.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-mono" style={{ color: '#4B3F72' }}>
              {requestId}
            </h1>
            <button
              onClick={copyId}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy ID"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            User: <span className="font-mono">{truncateId(req.userId, 16)}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {isExhausted && (
            <>
              <button
                onClick={() => setRerouteOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium border hover:bg-gray-50 transition-colors"
                style={{ color: '#4B3F72', borderColor: '#4B3F7240' }}
              >
                Re-Route
              </button>
              <Link
                href={`/requests/${requestId}/find-provider`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Find Provider
              </Link>
            </>
          )}
          {!isExhausted && (
            <Link
              href={`/requests/${requestId}/find-provider`}
              className="rounded-lg px-4 py-2 text-sm font-medium border hover:bg-gray-50 transition-colors"
              style={{ color: '#4B3F72', borderColor: '#4B3F7240' }}
            >
              Find Provider
            </Link>
          )}
        </div>
      </div>

      {/* Request Info */}
      <SectionCard title="Request Info">
        <div className="rounded-lg bg-gray-50 p-3 mb-4">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{req.rawText}</p>
        </div>
        <div className="divide-y divide-gray-100">
          <InfoRow label="Service Type" value={req.parsedIntent?.serviceType} />
          <InfoRow label="Industry" value={req.parsedIntent?.industryId} />
          <InfoRow
            label="Confidence"
            value={
              req.parsedIntent?.confidence !== undefined
                ? `${Math.round(req.parsedIntent.confidence * 100)}%`
                : undefined
            }
          />
          <InfoRow
            label="Time Window"
            value={
              req.timeWindow?.earliest
                ? `${new Date(req.timeWindow.earliest).toLocaleString()} — ${req.timeWindow.latest ? new Date(req.timeWindow.latest).toLocaleString() : 'flexible'}`
                : req.timeWindow?.flexible ? 'Flexible' : undefined
            }
          />
          <InfoRow
            label="Location"
            value={
              req.location?.address
                ? `${req.location.address.city || ''}, ${req.location.address.state || ''}`
                : req.location?.label
            }
          />
          <InfoRow label="Max Distance" value={req.maxDistanceMiles ? `${req.maxDistanceMiles} mi` : undefined} />
          <InfoRow label="Max Price" value={req.maxPriceCents ? formatCents(req.maxPriceCents) : undefined} />
          <InfoRow label="Current Wave" value={req.currentWave} />
          <InfoRow label="Wave Size" value={req.waveSize} />
        </div>
      </SectionCard>

      {/* Matched Providers */}
      <SectionCard title="Matched Providers">
        {req.rankedProviders.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No providers matched</p>
        ) : (
          <DataTable
            columns={providerColumns}
            data={req.rankedProviders}
            emptyMessage="No providers matched"
          />
        )}
      </SectionCard>

      {/* Offers */}
      <SectionCard title={`Offers (${offers.length})`}>
        {offers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No offers yet</p>
        ) : (
          <DataTable
            columns={offerColumns}
            data={offers}
            emptyMessage="No offers"
          />
        )}
      </SectionCard>

      {/* Transaction */}
      {transaction && (
        <SectionCard title="Transaction">
          <div className="divide-y divide-gray-100">
            <InfoRow
              label="Type"
              value={<StatusBadge status={transaction.type} />}
            />
            <InfoRow
              label="Status"
              value={<StatusBadge status={transaction.status} />}
            />
            <InfoRow label="Service Price" value={formatCents(transaction.servicePriceCents)} />
            <InfoRow label="Platform Fee" value={formatCents(transaction.platformFeeCents)} />
            <InfoRow label="Total Charged" value={
              <span className="font-semibold" style={{ color: '#4B3F72' }}>
                {formatCents(transaction.totalChargedCents)}
              </span>
            } />
            {transaction.holdAmountCents != null && (
              <InfoRow label="Hold Amount" value={formatCents(transaction.holdAmountCents)} />
            )}
            <InfoRow label="Payout Amount" value={formatCents(transaction.payoutAmountCents ?? 0)} />
            <InfoRow
              label="Payout Status"
              value={<StatusBadge status={transaction.payoutStatus} />}
            />
            {transaction.noShow && (
              <InfoRow label="No-Show" value={<span className="text-red-600 font-medium">Yes</span>} />
            )}
          </div>
        </SectionCard>
      )}

      <RerouteDialog
        open={rerouteOpen}
        requestId={requestId}
        onClose={() => setRerouteOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
