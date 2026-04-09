'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/data/confirm-dialog';
import { useReroute } from '@/lib/hooks/use-reroute';
import { useToast } from '@/components/data/toast';

interface RerouteDialogProps {
  open: boolean;
  requestId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RerouteDialog({ open, requestId, onClose, onSuccess }: RerouteDialogProps) {
  const [clearExclusions, setClearExclusions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reroute = useReroute(requestId);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setError(null);
    try {
      await reroute.mutateAsync({ clearExclusions });
      toast('Request re-routed successfully', 'success');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-route');
    }
  };

  const handleCancel = () => {
    setError(null);
    setClearExclusions(false);
    onClose();
  };

  return (
    <ConfirmDialog
      open={open}
      title="Re-Route Request"
      description="Re-enter this request into the automated matching engine."
      confirmLabel="Re-Route"
      confirmColor="#4B3F72"
      loading={reroute.isPending}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <div className="space-y-3">
        <label
          className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors"
          style={!clearExclusions ? { borderColor: '#4B3F72', backgroundColor: '#4B3F7208' } : { borderColor: '#E5E7EB' }}
        >
          <input
            type="radio"
            name="reroute-option"
            checked={!clearExclusions}
            onChange={() => setClearExclusions(false)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">Skip previous providers</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Excludes providers who already denied or were sent offers
            </p>
          </div>
        </label>

        <label
          className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors"
          style={clearExclusions ? { borderColor: '#4B3F72', backgroundColor: '#4B3F7208' } : { borderColor: '#E5E7EB' }}
        >
          <input
            type="radio"
            name="reroute-option"
            checked={clearExclusions}
            onChange={() => setClearExclusions(true)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">Fresh start — include all providers</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Clears exclusion list, providers who declined may now accept
            </p>
          </div>
        </label>

        {error && (
          <p className="text-xs font-medium" style={{ color: '#FF6B6B' }}>{error}</p>
        )}
      </div>
    </ConfirmDialog>
  );
}
