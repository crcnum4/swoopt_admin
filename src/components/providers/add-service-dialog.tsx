'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/data/confirm-dialog';

interface AddServiceDialogProps {
  open: boolean;
  loading: boolean;
  onConfirm: (service: {
    name: string;
    startingPrice: number;
    estimatedDurationMinutes: number | null;
    category: string;
    description: string;
    isAddon: boolean;
    requiresConsultation: boolean;
  }) => void;
  onCancel: () => void;
}

export function AddServiceDialog({ open, loading, onConfirm, onCancel }: AddServiceDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isAddon, setIsAddon] = useState(false);
  const [requiresConsultation, setRequiresConsultation] = useState(false);

  const handleConfirm = () => {
    const priceCents = Math.round(parseFloat(price) * 100);
    onConfirm({
      name: name.trim(),
      startingPrice: priceCents,
      estimatedDurationMinutes: duration ? parseInt(duration, 10) : null,
      category: category.trim(),
      description: description.trim(),
      isAddon,
      requiresConsultation,
    });
    // Reset form
    setName(''); setPrice(''); setDuration(''); setCategory('');
    setDescription(''); setIsAddon(false); setRequiresConsultation(false);
  };

  const canSubmit = name.trim().length > 0 && parseFloat(price) > 0;

  return (
    <ConfirmDialog
      open={open}
      title="Add Service"
      confirmLabel="Add Service"
      confirmColor="#4B3F72"
      loading={loading}
      onConfirm={handleConfirm}
      onCancel={onCancel}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Deep Tissue Massage"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="120.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Massage, Haircut"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional service description"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isAddon} onChange={(e) => setIsAddon(e.target.checked)} />
            Add-on service
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={requiresConsultation} onChange={(e) => setRequiresConsultation(e.target.checked)} />
            Requires consultation
          </label>
        </div>
        {!canSubmit && name.length > 0 && (
          <p className="text-xs" style={{ color: '#FF6B6B' }}>Name and price are required</p>
        )}
      </div>
    </ConfirmDialog>
  );
}
