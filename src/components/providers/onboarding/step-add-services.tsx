'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useServiceScan } from '@/lib/hooks/use-service-scan';
import { formatCents } from '@/lib/utils';
import type { OnboardingState } from '@/lib/hooks/use-onboarding-wizard';
import type { ExtractedService } from '@/types/service-scan';

interface Props {
  state: OnboardingState;
  update: (payload: Partial<OnboardingState>) => void;
  onNext: () => void;
}

interface ManualService {
  name: string;
  startingPrice: string;
  estimatedDurationMinutes: string;
}

export function StepAddServices({ state, update, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState(state.scanUrl);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [manualServices, setManualServices] = useState<ManualService[]>([]);
  const [newService, setNewService] = useState<ManualService>({ name: '', startingPrice: '', estimatedDurationMinutes: '' });

  const scanJob = useServiceScan(state.createdOrgId ?? '', state.scanJobId);

  // Auto-select all services when scan results arrive
  useEffect(() => {
    if (scanJob.data?.extractedServices && scanJob.data.extractedServices.length > 0 && selectedServices.size === 0) {
      setSelectedServices(new Set(scanJob.data.extractedServices.map((_, i) => i)));
    }
  }, [scanJob.data?.extractedServices, scanJob.data?.status, selectedServices.size]);

  const handleStartScan = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: apiError } = await api.post<{ job: { _id: string } }>(
        `/organizations/${state.createdOrgId}/service-scan`,
        { sourceUrl: scanUrl, sourceType: 'url' },
      );
      if (apiError || !data) throw new Error(apiError || 'Failed to start scan');
      update({ scanJobId: String(data.job._id), scanUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmScan = async () => {
    if (!scanJob.data?.extractedServices) return;
    setError(null);
    setLoading(true);
    try {
      const { error: apiError } = await api.post(
        `/organizations/${state.createdOrgId}/service-scan/${state.scanJobId}/confirm`,
        { selectedIndices: Array.from(selectedServices).sort((a, b) => a - b) },
      );
      if (apiError) throw new Error(apiError);
      update({ servicesAdded: true });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm services');
    } finally {
      setLoading(false);
    }
  };

  const addManualService = () => {
    if (!newService.name.trim() || !newService.startingPrice) return;
    setManualServices([...manualServices, { ...newService }]);
    setNewService({ name: '', startingPrice: '', estimatedDurationMinutes: '' });
  };

  const handleSubmitManual = async () => {
    if (manualServices.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      for (const svc of manualServices) {
        const { error: apiError } = await api.post(`/organizations/${state.createdOrgId}/services`, {
          name: svc.name.trim(),
          startingPrice: Math.round(parseFloat(svc.startingPrice) * 100),
          estimatedDurationMinutes: svc.estimatedDurationMinutes ? parseInt(svc.estimatedDurationMinutes) : null,
          source: 'manual',
        });
        if (apiError) throw new Error(apiError);
      }
      update({ servicesAdded: true });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add services');
    } finally {
      setLoading(false);
    }
  };

  if (state.servicesAdded) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Add Services</h3>
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#6FFFE9', backgroundColor: '#6FFFE910' }}>
          <p style={{ color: '#0D7377' }}>Services added successfully</p>
        </div>
        <button onClick={onNext} className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#4B3F72' }}>
          Next →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>Add Services</h3>
        <p className="text-sm text-gray-500 mt-1">Import services from website or add manually</p>
      </div>

      {!state.createdOrgId && (
        <div className="rounded-lg border p-3 text-sm" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p style={{ color: '#FF6B6B' }}>Organization ID missing — try clearing the draft and restarting.</p>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => update({ serviceMode: 'scan' })}
          className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
          style={state.serviceMode === 'scan' ? { backgroundColor: '#4B3F72', color: '#fff' } : { backgroundColor: '#F3F4F6', color: '#4B5563' }}
        >
          Scan Website
        </button>
        <button
          onClick={() => update({ serviceMode: 'manual' })}
          className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
          style={state.serviceMode === 'manual' ? { backgroundColor: '#4B3F72', color: '#fff' } : { backgroundColor: '#F3F4F6', color: '#4B5563' }}
        >
          Manual Add
        </button>
      </div>

      {state.serviceMode === 'scan' && (
        <div className="space-y-4">
          {!state.scanJobId && (
            <div className="flex gap-2">
              <input
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="https://www.business-website.com"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <button
                onClick={handleStartScan}
                disabled={!scanUrl.trim() || loading || !state.createdOrgId}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#4B3F72' }}
              >
                {loading ? 'Starting…' : 'Scan'}
              </button>
            </div>
          )}

          {state.scanJobId && scanJob.data && (
            <div>
              {(scanJob.data.status === 'pending' || scanJob.data.status === 'processing') && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  <span className="text-sm text-gray-600">Scanning website… this may take a minute</span>
                </div>
              )}

              {scanJob.data.status === 'failed' && (
                <div className="rounded-lg border p-4" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
                  <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>Scan failed</p>
                  <p className="text-xs text-gray-500 mt-1">{scanJob.data.error || 'Unknown error'}</p>
                  <button onClick={() => update({ scanJobId: null })} className="mt-2 text-xs font-medium" style={{ color: '#4B3F72' }}>Try again</button>
                </div>
              )}

              {(scanJob.data.status === 'review' || scanJob.data.status === 'confirmed') && scanJob.data.extractedServices && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Found {scanJob.data.extractedServices.length} services. {selectedServices.size} selected.
                    </p>
                    <button
                      onClick={() => {
                        if (selectedServices.size === scanJob.data!.extractedServices.length) {
                          setSelectedServices(new Set());
                        } else {
                          setSelectedServices(new Set(scanJob.data!.extractedServices.map((_, i) => i)));
                        }
                      }}
                      className="text-xs font-medium hover:opacity-80"
                      style={{ color: '#4B3F72' }}
                    >
                      {selectedServices.size === scanJob.data.extractedServices.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-gray-200 p-2">
                    {scanJob.data.extractedServices.map((svc: ExtractedService, idx: number) => (
                      <label key={idx} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedServices.has(idx)}
                          onChange={() => {
                            const next = new Set(selectedServices);
                            next.has(idx) ? next.delete(idx) : next.add(idx);
                            setSelectedServices(next);
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">{svc.name}</span>
                          {svc.startingAtPrice != null && (
                            <span className="ml-2 text-xs text-gray-500">from {formatCents(svc.startingAtPrice)}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={handleConfirmScan}
                    disabled={selectedServices.size === 0 || loading}
                    className="w-full rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#4B3F72' }}
                  >
                    {loading ? 'Importing…' : `Import ${selectedServices.size} Service${selectedServices.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {state.serviceMode === 'manual' && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
              <input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Deep Tissue Massage"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
              <input
                type="number"
                value={newService.startingPrice}
                onChange={(e) => setNewService({ ...newService, startingPrice: e.target.value })}
                placeholder="120"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-medium text-gray-500 mb-1">Min</label>
              <input
                type="number"
                value={newService.estimatedDurationMinutes}
                onChange={(e) => setNewService({ ...newService, estimatedDurationMinutes: e.target.value })}
                placeholder="60"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <button
              onClick={addManualService}
              disabled={!newService.name.trim() || !newService.startingPrice}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#4B3F72' }}
            >
              Add
            </button>
          </div>

          {manualServices.length > 0 && (
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {manualServices.map((svc, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-gray-800">{svc.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">${svc.startingPrice}</span>
                    {svc.estimatedDurationMinutes && <span className="text-xs text-gray-400">{svc.estimatedDurationMinutes}min</span>}
                    <button onClick={() => setManualServices(manualServices.filter((_, i) => i !== idx))} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmitManual}
            disabled={manualServices.length === 0 || loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#4B3F72' }}
          >
            {loading ? 'Adding…' : `Add ${manualServices.length} Service${manualServices.length !== 1 ? 's' : ''} & Continue`}
          </button>
        </div>
      )}

      {/* Skip option */}
      <button
        onClick={() => { update({ servicesAdded: true }); onNext(); }}
        className="w-full text-center text-xs font-medium text-gray-400 hover:text-gray-600"
      >
        Skip — add services later
      </button>

      {error && <p className="text-sm font-medium" style={{ color: '#FF6B6B' }}>{error}</p>}
    </div>
  );
}
