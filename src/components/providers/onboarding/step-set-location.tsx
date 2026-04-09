'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';

interface Props {
  state: OnboardingState;
  update: (payload: Partial<OnboardingState>) => void;
  onNext: () => void;
}

async function geocodeAddress(parts: {
  street?: string;
  city: string;
  state: string;
  postalcode?: string;
}): Promise<{ lat: number; lng: number } | null> {
  try {
    const params = new URLSearchParams({ format: 'json', limit: '1' });
    if (parts.street) params.set('street', parts.street);
    params.set('city', parts.city);
    params.set('state', parts.state);
    if (parts.postalcode) params.set('postalcode', parts.postalcode);
    params.set('country', 'US');

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { 'User-Agent': 'SwooptAdmin/1.0' } },
    );
    const results = await res.json();
    if (results.length > 0) {
      return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export function StepSetLocation({ state, update, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const hasAddress = state.addressCity.trim().length > 0 && state.addressState.trim().length > 0;
  const hasCoords = state.lat != null && state.lng != null;
  const canSubmit = hasAddress && hasCoords;

  const handleGeocode = async () => {
    if (!hasAddress) return;

    setGeocoding(true);
    setGeocodeStatus('idle');
    const result = await geocodeAddress({
      street: state.addressLine1.trim() || undefined,
      city: state.addressCity.trim(),
      state: state.addressState.trim(),
      postalcode: state.addressZip.trim() || undefined,
    });
    if (result) {
      update({ lat: result.lat, lng: result.lng });
      setGeocodeStatus('success');
    } else {
      setGeocodeStatus('failed');
    }
    setGeocoding(false);
  };

  const handleSubmit = async () => {
    if (state.locationSaved) {
      onNext();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Requires platform admin org role bypass (crcnum4/swoopt_bun_api#128)
      const { error: apiError } = await api.put(
        `/organizations/${state.createdOrgId}/location`,
        {
          address: {
            street: state.addressLine1.trim() || undefined,
            city: state.addressCity.trim(),
            state: state.addressState.trim(),
            zip: state.addressZip.trim() || undefined,
          },
          coordinates: { lat: state.lat, lng: state.lng },
        },
      );
      if (apiError) throw new Error(apiError);
      update({ locationSaved: true });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Set Location</h3>
        <p className="text-sm text-gray-500 mt-1">Enter the provider&apos;s business address</p>
      </div>

      {state.locationSaved && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#6FFFE9', backgroundColor: '#6FFFE910' }}>
          <p style={{ color: '#0D7377' }}>Location saved</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Street Address</label>
        <input
          value={state.addressLine1}
          onChange={(e) => { update({ addressLine1: e.target.value }); setGeocodeStatus('idle'); }}
          disabled={state.locationSaved}
          placeholder="123 Main St"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">City *</label>
          <input
            value={state.addressCity}
            onChange={(e) => { update({ addressCity: e.target.value }); setGeocodeStatus('idle'); }}
            disabled={state.locationSaved}
            placeholder="Providence"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-gray-500 mb-1">State *</label>
          <input
            value={state.addressState}
            onChange={(e) => { update({ addressState: e.target.value }); setGeocodeStatus('idle'); }}
            disabled={state.locationSaved}
            placeholder="RI"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs font-medium text-gray-500 mb-1">ZIP</label>
          <input
            value={state.addressZip}
            onChange={(e) => { update({ addressZip: e.target.value }); setGeocodeStatus('idle'); }}
            disabled={state.locationSaved}
            placeholder="02903"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Geocode section */}
      {!state.locationSaved && (
        <div className="rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Coordinates</p>
              {hasCoords ? (
                <p className="text-sm font-mono text-gray-800">
                  {state.lat!.toFixed(6)}, {state.lng!.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Not set — click Geocode to look up from address</p>
              )}
            </div>
            <button
              onClick={handleGeocode}
              disabled={!hasAddress || geocoding || state.locationSaved}
              className="rounded-lg px-3 py-1.5 text-xs font-medium border hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ color: '#4B3F72', borderColor: '#4B3F7240' }}
            >
              {geocoding ? 'Looking up…' : 'Geocode'}
            </button>
          </div>

          {geocodeStatus === 'success' && (
            <p className="text-xs" style={{ color: '#0D7377' }}>
              Coordinates found from address
            </p>
          )}
          {geocodeStatus === 'failed' && (
            <div>
              <p className="text-xs" style={{ color: '#FF6B6B' }}>
                Could not geocode this address. You can enter coordinates manually:
              </p>
              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="any"
                    value={state.lat ?? ''}
                    onChange={(e) => update({ lat: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Latitude (e.g. 41.824)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    step="any"
                    value={state.lng ?? ''}
                    onChange={(e) => update({ lng: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Longitude (e.g. -71.412)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {hasAddress && !hasCoords && !state.locationSaved && geocodeStatus !== 'failed' && (
        <p className="text-xs text-gray-500">Click &quot;Geocode&quot; to look up coordinates from the address — coordinates are required for provider matching.</p>
      )}

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={(!canSubmit && !state.locationSaved) || loading || geocoding}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#4B3F72' }}
      >
        {loading ? 'Saving…' : geocoding ? 'Geocoding…' : state.locationSaved ? 'Next →' : 'Save Location & Continue'}
      </button>
    </div>
  );
}
