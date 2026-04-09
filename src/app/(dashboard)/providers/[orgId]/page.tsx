'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useOrganizationDetail } from '@/lib/hooks/use-organization-detail';
import { useOrgVerification } from '@/lib/hooks/use-org-verification';
import { useOrgServices, useAddService } from '@/lib/hooks/use-org-services';
import { useOrgAvailability } from '@/lib/hooks/use-org-availability';
import { StatusBadge } from '@/components/data/status-badge';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { AddServiceDialog } from '@/components/providers/add-service-dialog';
import { useToast } from '@/components/data/toast';
import { formatCents, formatRelativeTime } from '@/lib/utils';
import type { ServiceItem } from '@/types/service-item';

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

function VerificationToggle({
  label,
  enabled,
  timestamp,
  loading,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  timestamp?: string | null;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {enabled && timestamp && (
          <p className="text-xs text-gray-400">Since {new Date(timestamp).toLocaleDateString()}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50"
        style={{ backgroundColor: enabled ? '#6FFFE9' : '#E5E7EB' }}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? 'translateX(22px)' : 'translateX(3px)' }}
        />
      </button>
    </div>
  );
}

const serviceColumns: Column<ServiceItem>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => <span className="text-sm font-medium text-gray-800">{row.name}</span>,
  },
  {
    key: 'price',
    header: 'Starting Price',
    render: (row) => <span className="text-sm" style={{ color: '#4B3F72' }}>{formatCents(row.startingPrice)}</span>,
  },
  {
    key: 'duration',
    header: 'Duration',
    render: (row) => <span className="text-xs text-gray-600">{row.estimatedDurationMinutes ? `${row.estimatedDurationMinutes} min` : '—'}</span>,
    hideOnMobile: true,
  },
  {
    key: 'category',
    header: 'Category',
    render: (row) => <span className="text-xs text-gray-600">{row.category || '—'}</span>,
    hideOnMobile: true,
  },
  {
    key: 'source',
    header: 'Source',
    render: (row) => <span className="text-xs text-gray-400">{row.source}</span>,
    hideOnMobile: true,
  },
  {
    key: 'active',
    header: 'Active',
    render: (row) => (
      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${row.active ? 'bg-green-500' : 'bg-gray-300'}`} />
    ),
  },
];

export default function OrgDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: org, isLoading, isError, error, refetch } = useOrganizationDetail(orgId);
  const { data: services, isLoading: servicesLoading, isError: servicesError } = useOrgServices(orgId);
  const verification = useOrgVerification(orgId);
  const availability = useOrgAvailability(orgId);
  const addService = useAddService(orgId);
  const { toast } = useToast();

  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [confirmVerify, setConfirmVerify] = useState<{ field: 'verified' | 'insured' | 'licensed'; newValue: boolean } | null>(null);

  const handleVerificationToggle = (field: 'verified' | 'insured' | 'licensed') => {
    const currentValue = org?.verification?.[field] ?? false;
    if (currentValue) {
      // Turning off — confirm first
      setConfirmVerify({ field, newValue: false });
    } else {
      // Turning on — immediate
      verification.mutate({ [field]: true }, {
        onSuccess: () => toast(`${field} badge enabled`, 'success'),
        onError: (err) => toast(err.message, 'error'),
      });
    }
  };

  const confirmVerifyOff = () => {
    if (!confirmVerify) return;
    verification.mutate({ [confirmVerify.field]: false }, {
      onSuccess: () => { toast(`${confirmVerify.field} badge removed`, 'info'); setConfirmVerify(null); },
      onError: (err) => toast(err.message, 'error'),
    });
  };

  const handleAddService = (service: Parameters<typeof addService.mutate>[0]) => {
    addService.mutate(service, {
      onSuccess: () => { toast('Service added', 'success'); setAddServiceOpen(false); },
      onError: (err) => toast(err.message, 'error'),
    });
  };

  const handleAvailabilityToggle = () => {
    if (!org) return;
    availability.mutate(!org.isAvailable, {
      onSuccess: () => toast(org.isAvailable ? 'Provider set to unavailable' : 'Provider set to available', 'success'),
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

  if (isError || !org) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Provider Detail</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load organization</p>
          <p className="mt-1 text-sm text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90" style={{ backgroundColor: '#FF6B6B' }}>Retry</button>
        </div>
      </div>
    );
  }

  const addr = org.location?.address;
  const locationStr = addr
    ? [addr.line1 || addr.street, addr.city, addr.region || addr.state, addr.postalCode || addr.zip].filter(Boolean).join(', ')
    : org.location?.label || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/providers" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#4B3F72' }}>
          ← Back to Providers
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>{org.name}</h1>
          <StatusBadge status={org.status} />
          <span className={`inline-flex h-3 w-3 rounded-full ${org.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        <button
          onClick={handleAvailabilityToggle}
          disabled={availability.isPending}
          className="rounded-lg px-4 py-2 text-sm font-medium border hover:bg-gray-50 transition-colors disabled:opacity-50"
          style={{ color: '#4B3F72', borderColor: '#4B3F7240' }}
        >
          {org.isAvailable ? 'Set Unavailable' : 'Set Available'}
        </button>
      </div>

      {/* Org Info */}
      <SectionCard title="Organization Info">
        <div className="divide-y divide-gray-100">
          <InfoRow label="Name" value={org.name} />
          <InfoRow label="Slug" value={<span className="font-mono text-xs">{org.slug}</span>} />
          <InfoRow label="Industry" value={org.industryId} />
          <InfoRow label="Phone" value={org.phone} />
          <InfoRow label="Email" value={org.email} />
          <InfoRow label="Website" value={org.website ? <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#4B3F72' }}>{org.website}</a> : undefined} />
          <InfoRow label="Description" value={org.description} />
          <InfoRow label="Location" value={locationStr} />
          <InfoRow label="Created" value={formatRelativeTime(org.createdAt)} />
          {org.createdByAdmin && <InfoRow label="Created By Admin" value={<span className="font-mono text-xs">{org.createdByAdmin}</span>} />}
        </div>
      </SectionCard>

      {/* Verification */}
      <SectionCard title="Verification Badges">
        <div className="divide-y divide-gray-100">
          <VerificationToggle
            label="Verified"
            enabled={org.verification?.verified ?? false}
            timestamp={org.verification?.verifiedAt}
            loading={verification.isPending}
            onToggle={() => handleVerificationToggle('verified')}
          />
          <VerificationToggle
            label="Insured"
            enabled={org.verification?.insured ?? false}
            timestamp={org.verification?.insuredAt}
            loading={verification.isPending}
            onToggle={() => handleVerificationToggle('insured')}
          />
          <VerificationToggle
            label="Licensed"
            enabled={org.verification?.licensed ?? false}
            timestamp={org.verification?.licensedAt}
            loading={verification.isPending}
            onToggle={() => handleVerificationToggle('licensed')}
          />
        </div>
      </SectionCard>

      {/* Services */}
      <SectionCard
        title="Services"
        action={
          <button
            onClick={() => setAddServiceOpen(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4B3F72' }}
          >
            Add Service
          </button>
        }
      >
        {servicesError ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Unable to load services — admin service access may not be enabled yet
          </p>
        ) : (
          <DataTable
            columns={serviceColumns}
            data={services ?? []}
            loading={servicesLoading}
            skeletonRows={3}
            emptyMessage="No services added yet"
          />
        )}
      </SectionCard>

      {/* Ratings */}
      <SectionCard title="Ratings">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold" style={{ color: '#4B3F72' }}>
            {org.currentRating > 0 ? `★ ${org.currentRating.toFixed(1)}` : '—'}
          </span>
          <span className="text-sm text-gray-500">
            {org.totalRatings > 0 ? `${org.totalRatings} rating${org.totalRatings !== 1 ? 's' : ''}` : 'No ratings yet'}
          </span>
        </div>
      </SectionCard>

      {/* Dialogs */}
      <AddServiceDialog
        open={addServiceOpen}
        loading={addService.isPending}
        onConfirm={handleAddService}
        onCancel={() => setAddServiceOpen(false)}
      />

      <ConfirmDialog
        open={!!confirmVerify}
        title={`Remove ${confirmVerify?.field} badge?`}
        description="This will remove the verification badge from this organization."
        confirmLabel="Remove Badge"
        confirmColor="#FF6B6B"
        loading={verification.isPending}
        onConfirm={confirmVerifyOff}
        onCancel={() => setConfirmVerify(null)}
      />
    </div>
  );
}
