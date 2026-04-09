'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';

interface Props {
  state: OnboardingState;
  update: (payload: Partial<OnboardingState>) => void;
  onNext: () => void;
}

export function StepCreateUser({ state, update, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = state.userEmail.trim() && state.temporaryPassword.length >= 8;

  const handleSubmit = async () => {
    if (state.createdUserId) {
      onNext();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { data, error: apiError } = await api.post<{ _id: string }>('/admin/users', {
        email: state.userEmail.trim(),
        phone: state.userPhone.trim() || undefined,
        temporaryPassword: state.temporaryPassword,
        forceVerifyEmail: state.forceVerifyEmail,
      });
      if (apiError || !data) throw new Error(apiError || 'Failed to create user');
      update({ createdUserId: data._id });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Create User Account</h3>
        <p className="text-sm text-gray-500 mt-1">Create a Swoopt account for the provider</p>
      </div>

      {state.createdUserId && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#6FFFE9', backgroundColor: '#6FFFE910' }}>
          <p style={{ color: '#0D7377' }}>User already created (ID: {state.createdUserId})</p>
          <p className="text-xs text-gray-500 mt-1">Click Next to continue, or clear the draft to start over.</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
        <input
          type="email"
          value={state.userEmail}
          onChange={(e) => update({ userEmail: e.target.value })}
          disabled={!!state.createdUserId}
          placeholder="provider@business.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
        <input
          type="tel"
          value={state.userPhone}
          onChange={(e) => update({ userPhone: e.target.value })}
          disabled={!!state.createdUserId}
          placeholder="(555) 123-4567"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Temporary Password * (min 8 chars)</label>
        <input
          type="text"
          value={state.temporaryPassword}
          onChange={(e) => update({ temporaryPassword: e.target.value })}
          disabled={!!state.createdUserId}
          placeholder="TempPass123!"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={state.forceVerifyEmail}
          onChange={(e) => update({ forceVerifyEmail: e.target.checked })}
          disabled={!!state.createdUserId}
        />
        Force verify email (provider can&apos;t check inbox during call)
      </label>

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit && !state.createdUserId || loading}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#4B3F72' }}
      >
        {loading ? 'Creating…' : state.createdUserId ? 'Next →' : 'Create User & Continue'}
      </button>
    </div>
  );
}
