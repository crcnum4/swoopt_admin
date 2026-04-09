'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { INDUSTRIES } from '@/lib/constants';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';

interface Props {
  state: OnboardingState;
  update: (payload: Partial<OnboardingState>) => void;
  onNext: () => void;
}

export function StepCreateOrg({ state, update, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = state.orgName.trim().length > 0;

  const handleSubmit = async () => {
    if (state.createdOrgId) {
      onNext();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { data, error: apiError } = await api.post<{ organization: { _id: string } }>('/admin/organizations', {
        userId: state.createdUserId,
        name: state.orgName.trim(),
        description: state.orgDescription.trim() || undefined,
        phone: state.orgPhone.trim() || undefined,
        industryId: state.orgIndustryId || undefined,
      });
      if (apiError || !data) throw new Error(apiError || 'Failed to create organization');
      update({ createdOrgId: String(data.organization._id) });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Create Organization</h3>
        <p className="text-sm text-gray-500 mt-1">Set up the provider&apos;s business profile</p>
      </div>

      {state.createdOrgId && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#6FFFE9', backgroundColor: '#6FFFE910' }}>
          <p style={{ color: '#0D7377' }}>Organization already created (ID: {state.createdOrgId})</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Business Name *</label>
        <input
          value={state.orgName}
          onChange={(e) => update({ orgName: e.target.value })}
          disabled={!!state.createdOrgId}
          placeholder="Serenity Day Spa"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
        <select
          value={state.orgIndustryId}
          onChange={(e) => update({ orgIndustryId: e.target.value })}
          disabled={!!state.createdOrgId}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => (
            <option key={i.id} value={i.id}>{i.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Business Phone</label>
        <input
          type="tel"
          value={state.orgPhone}
          onChange={(e) => update({ orgPhone: e.target.value })}
          disabled={!!state.createdOrgId}
          placeholder="(555) 987-6543"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
        <textarea
          value={state.orgDescription}
          onChange={(e) => update({ orgDescription: e.target.value })}
          disabled={!!state.createdOrgId}
          placeholder="Brief description of the business…"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit && !state.createdOrgId || loading}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#4B3F72' }}
      >
        {loading ? 'Creating…' : state.createdOrgId ? 'Next →' : 'Create Organization & Continue'}
      </button>
    </div>
  );
}
