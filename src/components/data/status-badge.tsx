'use client';

import { getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  colorMap?: Record<string, { bg: string; text: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  routing: 'Routing',
  offering: 'Offering',
  user_accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  rated: 'Rated',
  cancelled: 'Cancelled',
  expired: 'Expired',
  user_denied: 'Denied',
  exhausted: 'Exhausted',
  draft: 'Draft',
  parsing: 'Parsing',
  followup_needed: 'Followup',
  // Offer statuses
  pending: 'Pending',
  accepted_by_provider: 'Provider Accepted',
  accepted_by_user: 'User Accepted',
  denied_by_provider: 'Provider Denied',
  denied_by_user: 'User Denied',
  more_data_requested: 'More Data',
  withdrawn: 'Withdrawn',
  not_selected: 'Not Selected',
  // Transaction statuses
  hold: 'Hold',
  charged: 'Charged',
  partially_refunded: 'Partial Refund',
  refunded: 'Refunded',
  failed: 'Failed',
  // Organization statuses
  active: 'Active',
  inactive: 'Inactive',
  pending_verification: 'Pending Verification',
  pending_deletion: 'Pending Deletion',
  blocked: 'Blocked',
  // Verification statuses
  approved: 'Approved',
  rejected: 'Rejected',
  // Verification types
  verified: 'Verified',
  insured: 'Insured',
  licensed: 'Licensed',
  // Transaction types
  standard: 'Standard',
  medical_hold: 'Medical Hold',
  legal_exempt: 'Legal Exempt',
  // Payout statuses
  held: 'Held',
  claimable: 'Claimable',
  processing: 'Processing',
};

export function StatusBadge({ status, label, colorMap }: StatusBadgeProps) {
  const colors = colorMap?.[status] ?? getStatusColor(status);
  const displayLabel = label ?? STATUS_LABELS[status] ?? status.replace(/_/g, ' ');

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      {displayLabel}
    </span>
  );
}
