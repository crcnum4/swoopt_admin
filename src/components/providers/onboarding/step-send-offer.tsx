'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/data/toast';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';

interface Props {
  state: OnboardingState;
  reset: () => void;
}

export function StepSendOffer({ state, reset }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOffer = async () => {
    if (!state.serviceRequestId || !state.createdOrgId) return;
    setError(null);
    setLoading(true);
    try {
      const { error: apiError } = await api.post(
        `/admin/service-requests/${state.serviceRequestId}/manual-offer`,
        { orgId: state.createdOrgId },
      );
      if (apiError) throw new Error(apiError);
      toast(`Offer sent to ${state.orgName}!`, 'success');
      reset();
      router.push(`/requests/${state.serviceRequestId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  if (state.offerSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto" style={{ backgroundColor: '#6FFFE920' }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#6FFFE9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Offer Sent!</h3>
        <p className="text-sm text-gray-500">The provider has been onboarded and the offer is on its way.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Send Offer</h3>
        <p className="text-sm text-gray-500 mt-1">
          Send the manual offer to <strong>{state.orgName}</strong> for the original service request
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <span className="text-xs text-gray-500">Provider</span>
            <p className="font-medium" style={{ color: '#4B3F72' }}>{state.orgName}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Request ID</span>
            <p className="font-mono text-xs text-gray-600">{state.serviceRequestId}</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <button
        onClick={handleSendOffer}
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#FF6B6B' }}
      >
        {loading ? 'Sending…' : `Send Offer to ${state.orgName}`}
      </button>

      <button
        onClick={() => { reset(); router.push('/providers'); }}
        className="w-full text-center text-xs font-medium text-gray-400 hover:text-gray-600"
      >
        Skip — don&apos;t send offer
      </button>
    </div>
  );
}
