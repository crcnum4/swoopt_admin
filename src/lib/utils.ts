/**
 * Format cents as a dollar string with commas.
 * e.g. 1234567 → "$12,345.67"
 */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return '$' + dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a date string as a relative time string.
 * e.g. "2h ago", "3d ago", "just now"
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;

  if (diffMs < 0) return 'just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Simple classname joiner — filters falsy values and joins with space.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate a MongoDB ObjectId for display.
 */
export function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id;
  return id.slice(0, length) + '…';
}

/**
 * Extract a display label from a field that may be a plain ID string
 * or a populated object (e.g. { _id, email } or { _id, name }).
 */
export function displayRef(
  value: string | { _id: string; email?: string; name?: string } | undefined | null,
  field: 'email' | 'name' = 'email',
): string {
  if (!value) return '—';
  if (typeof value === 'string') return truncateId(value, 12);
  return (value as Record<string, string>)[field] || value._id;
}

/**
 * Status color mapping for ServiceRequestStatus.
 */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Active
  routing: { bg: '#4B3F7215', text: '#4B3F72' },
  offering: { bg: '#4B3F7215', text: '#4B3F72' },
  user_accepted: { bg: '#4B3F7215', text: '#4B3F72' },
  in_progress: { bg: '#4B3F7215', text: '#4B3F72' },
  // Success
  completed: { bg: '#6FFFE920', text: '#0D7377' },
  rated: { bg: '#6FFFE920', text: '#0D7377' },
  // History
  cancelled: { bg: '#F3F4F6', text: '#6B7280' },
  expired: { bg: '#F3F4F6', text: '#6B7280' },
  user_denied: { bg: '#F3F4F6', text: '#6B7280' },
  // Exhausted
  exhausted: { bg: '#FF6B6B15', text: '#FF6B6B' },
  // Pending
  draft: { bg: '#FEF3C7', text: '#D97706' },
  parsing: { bg: '#FEF3C7', text: '#D97706' },
  followup_needed: { bg: '#FEF3C7', text: '#D97706' },
};

export function getStatusColor(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
}

/**
 * Build a Google Maps search URL centered on lat/lng for external provider lookup.
 * Falls back to text-based Google search if no coordinates provided.
 */
export function buildGoogleSearchUrl(
  serviceType: string,
  city: string,
  state: string,
  lat?: number | null,
  lng?: number | null,
): string {
  const query = encodeURIComponent(serviceType);
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/${query}/@${lat},${lng},14z`;
  }
  const textQuery = `${serviceType} near ${city}, ${state}`;
  return `https://www.google.com/search?q=${encodeURIComponent(textQuery)}`;
}
