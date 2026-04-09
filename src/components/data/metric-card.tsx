'use client';

import Link from 'next/link';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  accent?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const ACCENT_COLORS = {
  default: { border: '#E0E0E0', iconBg: '#E0E0E020' },
  success: { border: '#6FFFE9', iconBg: '#6FFFE920' },
  warning: { border: '#FFB347', iconBg: '#FFB34720' },
  error:   { border: '#FF6B6B', iconBg: '#FF6B6B20' },
};

export function MetricCard({
  label,
  value,
  icon,
  href,
  accent = 'default',
  loading = false,
}: MetricCardProps) {
  const colors = ACCENT_COLORS[accent];

  const card = (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${href ? 'hover:shadow-md cursor-pointer' : ''}`}
      style={{ borderLeftWidth: 4, borderLeftColor: colors.border }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.iconBg }}
        >
          {icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
      ) : (
        <span className="text-3xl font-bold" style={{ color: '#4B3F72' }}>{value}</span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
