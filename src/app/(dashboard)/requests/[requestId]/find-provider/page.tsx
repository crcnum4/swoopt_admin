'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useServiceRequestDetail } from '@/lib/hooks/use-service-request-detail';
import { useProviderSearch } from '@/lib/hooks/use-provider-search';
import { useManualOffer } from '@/lib/hooks/use-manual-offer';
import { DataTable, type Column } from '@/components/data/data-table';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useToast } from '@/components/data/toast';
import { buildGoogleSearchUrl, truncateId } from '@/lib/utils';
import type { ProviderSearchResult } from '@/types/organization';

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

export default function FindProviderPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { data, isLoading: requestLoading } = useServiceRequestDetail(requestId);
  const { toast } = useToast();
  const manualOffer = useManualOffer(requestId);

  const [activeTab, setActiveTab] = useState<'swoopt' | 'external'>('swoopt');
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [sendingToOrg, setSendingToOrg] = useState<ProviderSearchResult | null>(null);

  const req = data?.serviceRequest;
  const lat = req?.location?.point?.coordinates?.[1] ?? null;
  const lng = req?.location?.point?.coordinates?.[0] ?? null;
  const hasLocation = lat !== null && lng !== null;

  const { data: providers, isLoading: searchLoading, isError: searchError } = useProviderSearch({
    lat,
    lng,
    radiusMiles,
    industryId: req?.parsedIntent?.industryId,
  });

  const handleSendOffer = async () => {
    if (!sendingToOrg) return;
    try {
      await manualOffer.mutateAsync({ orgId: sendingToOrg._id });
      toast(`Manual offer sent to ${sendingToOrg.name}`, 'success');
      setSendingToOrg(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to send offer', 'error');
    }
  };

  const providerColumns: Column<ProviderSearchResult>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="text-sm font-medium" style={{ color: '#4B3F72' }}>{row.name}</span>
      ),
    },
    {
      key: 'distance',
      header: 'Distance',
      render: (row) => (
        <span className="text-xs text-gray-600">
          {row.distanceMiles !== undefined ? `${row.distanceMiles.toFixed(1)} mi` : '—'}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => (
        <span className="text-xs text-gray-700">
          {row.currentRating > 0
            ? `★ ${row.currentRating.toFixed(1)} (${row.totalRatings})`
            : 'No ratings'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'verified',
      header: 'Verified',
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
      key: 'available',
      header: 'Available',
      render: (row) => (
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${row.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row) => (
        <div className="text-xs text-gray-500">
          {row.phone && <div>{row.phone}</div>}
          {row.email && <div className="truncate max-w-[150px]">{row.email}</div>}
          {!row.phone && !row.email && '—'}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'action',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSendingToOrg(row); }}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: '#4B3F72' }}
        >
          Send Offer
        </button>
      ),
    },
  ];

  if (requestLoading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!req) {
    return (
      <div>
        <p className="text-sm text-gray-500">Request not found</p>
        <Link href="/requests/support-queue" className="text-sm font-medium mt-2 inline-block" style={{ color: '#4B3F72' }}>
          ← Back to Support Queue
        </Link>
      </div>
    );
  }

  const googleUrl = buildGoogleSearchUrl(
    req.parsedIntent?.serviceType || 'service',
    req.location?.address?.city || 'nearby',
    req.location?.address?.state || '',
    lat,
    lng,
  );

  return (
    <div className="space-y-6">
      {/* Back link + context banner */}
      <div>
        <Link
          href={`/requests/${requestId}`}
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#4B3F72' }}
        >
          ← Back to Request Detail
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-xs text-gray-500">Service</span>
            <p className="font-medium" style={{ color: '#4B3F72' }}>
              {req.parsedIntent?.serviceType || 'Unknown'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Location</span>
            <p className="font-medium text-gray-800">
              {req.location?.address?.city || req.location?.label || '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Time Window</span>
            <p className="font-medium text-gray-800">
              {req.timeWindow?.earliest
                ? new Date(req.timeWindow.earliest).toLocaleString()
                : 'Flexible'}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Distance Pref</span>
            <p className="font-medium text-gray-800">{req.maxDistanceMiles} mi</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('swoopt')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={activeTab === 'swoopt' ? { color: '#4B3F72' } : { color: '#9CA3AF' }}
        >
          Swoopt Providers
          {activeTab === 'swoopt' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#4B3F72' }} />
          )}
        </button>
        <button
          onClick={() => setActiveTab('external')}
          className="px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={activeTab === 'external' ? { color: '#4B3F72' } : { color: '#9CA3AF' }}
        >
          External Search
          {activeTab === 'external' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#4B3F72' }} />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'swoopt' && (
        <div className="space-y-4">
          {!hasLocation ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium">No location available for this request</p>
              <p className="text-xs text-amber-600 mt-1">Provider search requires coordinates from the request location</p>
            </div>
          ) : (
            <>
              {/* Search controls */}
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Radius</label>
                  <select
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {RADIUS_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r} miles</option>
                    ))}
                  </select>
                </div>
                {req.parsedIntent?.industryId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
                    <span className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 bg-gray-50">
                      {req.parsedIntent.industryId}
                    </span>
                  </div>
                )}
                {providers && (
                  <span className="text-xs text-gray-500 pb-2">
                    {providers.length} provider{providers.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>

              {/* Results */}
              <DataTable
                columns={providerColumns}
                data={providers ?? []}
                loading={searchLoading}
                skeletonRows={3}
                emptyMessage={searchError ? 'Search failed — try again' : 'No providers found in this area'}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'external' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Search for providers outside the Swoopt network. Call the business, pitch the appointment, and onboard them.
            </p>
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4B3F72' }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {hasLocation ? 'Search Google Maps for Providers' : 'Search Google for Providers'}
            </a>

            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Operator Script</p>
              <p className="text-sm text-gray-700 italic">
                &ldquo;Hi, I&rsquo;m [name] from Swoopt. We have a customer looking for{' '}
                <strong>{req.parsedIntent?.serviceType || 'a service'}</strong> today near your location.
                Do you have availability? We&rsquo;d love to set you up on our platform — it&rsquo;s free,
                takes about 5 minutes, and we&rsquo;ll send this appointment right over.&rdquo;
              </p>
            </div>

            <div className="mt-4">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                title="Coming in Phase 3"
              >
                Onboard &amp; Send Offer
                <span className="text-[10px] bg-gray-200 rounded px-1.5 py-0.5">Phase 3</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Offer Confirmation */}
      <ConfirmDialog
        open={!!sendingToOrg}
        title="Send Manual Offer"
        description={sendingToOrg ? `Send a manual offer to ${sendingToOrg.name}?` : ''}
        confirmLabel="Send Offer"
        confirmColor="#4B3F72"
        loading={manualOffer.isPending}
        onConfirm={handleSendOffer}
        onCancel={() => setSendingToOrg(null)}
      >
        {sendingToOrg && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Provider:</span> {sendingToOrg.name}</p>
            <p><span className="font-medium">Distance:</span> {sendingToOrg.distanceMiles?.toFixed(1)} mi</p>
            {sendingToOrg.currentRating > 0 && (
              <p><span className="font-medium">Rating:</span> ★ {sendingToOrg.currentRating.toFixed(1)}</p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
