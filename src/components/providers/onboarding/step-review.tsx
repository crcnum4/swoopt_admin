'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';

interface Props {
  state: OnboardingState;
  update: (payload: Partial<OnboardingState>) => void;
  onNext: () => void;
}

export function StepReview({ state, update, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    if (state.activated) {
      onNext();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Set availability
      if (state.isAvailable) {
        await api.put(`/organizations/${state.createdOrgId}/availability`, { isAvailable: true });
      }

      // Force password reset
      if (state.forcePasswordReset) {
        await api.put(`/admin/users/${state.createdUserId}/force-password-reset`, {});
      }

      // Welcome credits
      if (state.welcomeCreditsCents > 0) {
        await api.post(`/admin/users/${state.createdUserId}/credits`, {
          amountCents: state.welcomeCreditsCents,
          reason: 'Welcome credits — onboarded via admin',
        });
      }

      update({ activated: true });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Review & Activate</h3>
        <p className="text-sm text-gray-500 mt-1">Confirm details and activate the provider</p>
      </div>

      {state.activated && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#6FFFE9', backgroundColor: '#6FFFE910' }}>
          <p style={{ color: '#0D7377' }}>Provider activated successfully!</p>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500">User</p>
          <p className="text-sm text-gray-800">{state.userFirstName} {state.userLastName}</p>
          <p className="text-xs text-gray-500">{state.userEmail}</p>
          {state.userPhone && <p className="text-xs text-gray-500">{state.userPhone}</p>}
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Organization</p>
          <p className="text-sm text-gray-800">{state.orgName}</p>
          {state.orgIndustryId && <p className="text-xs text-gray-500">{state.orgIndustryId}</p>}
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Location</p>
          <p className="text-sm text-gray-800">
            {[state.addressLine1, state.addressCity, state.addressState, state.addressZip].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Services</p>
          <p className="text-sm text-gray-800">{state.servicesAdded ? 'Added' : 'Skipped'}</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Set Available</p>
            <p className="text-xs text-gray-500">Provider can receive offers immediately</p>
          </div>
          <input
            type="checkbox"
            checked={state.isAvailable}
            onChange={(e) => update({ isAvailable: e.target.checked })}
            disabled={state.activated}
            className="h-4 w-4"
          />
        </label>

        <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Force Password Reset</p>
            <p className="text-xs text-gray-500">Provider must change password on first login</p>
          </div>
          <input
            type="checkbox"
            checked={state.forcePasswordReset}
            onChange={(e) => update({ forcePasswordReset: e.target.checked })}
            disabled={state.activated}
            className="h-4 w-4"
          />
        </label>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Welcome Credits</p>
              <p className="text-xs text-gray-500">Issue credits to the provider&apos;s account</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={state.welcomeCreditsCents > 0 ? state.welcomeCreditsCents / 100 : ''}
                onChange={(e) => update({ welcomeCreditsCents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0 })}
                disabled={state.activated}
                placeholder="0"
                className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#4B3F72' }}
      >
        {loading ? 'Activating…' : state.activated ? (state.serviceRequestId ? 'Next — Send Offer →' : 'Done!') : 'Activate Provider'}
      </button>
    </div>
  );
}
