'use client';

import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats';
import { MetricCard } from '@/components/data/metric-card';
import { formatCents } from '@/lib/utils';

const iconProps = {
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

function UsersIcon() {
  return <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function BuildingIcon() {
  return <svg {...iconProps}><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22V12h6v10" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /></svg>;
}
function InboxIcon() {
  return <svg {...iconProps}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}
function AlertTriangleIcon() {
  return <svg {...iconProps}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function DollarIcon() {
  return <svg {...iconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}
function CheckCircleIcon() {
  return <svg {...iconProps}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
function SignalIcon() {
  return <svg {...iconProps}><path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 20V4" /></svg>;
}
function ReceiptIcon() {
  return <svg {...iconProps}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" /><path d="M8 10h8" /><path d="M8 14h4" /></svg>;
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  const activeRequests = stats
    ? (stats.serviceRequests.byStatus.routing || 0) +
      (stats.serviceRequests.byStatus.offering || 0) +
      (stats.serviceRequests.byStatus.user_accepted || 0) +
      (stats.serviceRequests.byStatus.in_progress || 0)
    : 0;

  const exhaustedRequests = stats?.serviceRequests.byStatus.exhausted || 0;

  if (isError) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Dashboard</h1>
        <div className="mt-6 rounded-lg border p-6 text-center" style={{ borderColor: '#FF6B6B40', backgroundColor: '#FF6B6B08' }}>
          <p className="font-medium" style={{ color: '#FF6B6B' }}>Failed to load dashboard stats</p>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Platform overview</p>

      {/* Primary KPI cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          label="Total Users"
          value={stats?.users.total ?? 0}
          icon={<UsersIcon />}
          loading={isLoading}
        />
        <MetricCard
          label="Organizations"
          value={stats?.organizations.total ?? 0}
          icon={<BuildingIcon />}
          loading={isLoading}
        />
        <MetricCard
          label="Active Requests"
          value={activeRequests}
          icon={<InboxIcon />}
          accent={activeRequests > 0 ? 'success' : 'default'}
          loading={isLoading}
        />
        <MetricCard
          label="Exhausted Requests"
          value={exhaustedRequests}
          icon={<AlertTriangleIcon />}
          accent="error"
          href="/requests/support-queue"
          loading={isLoading}
        />
        <MetricCard
          label="Platform Revenue"
          value={formatCents(stats?.revenue.totalPlatformFeeCents ?? 0)}
          icon={<DollarIcon />}
          loading={isLoading}
        />
      </div>

      {/* Secondary row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Verified Orgs"
          value={stats ? `${stats.organizations.verified} / ${stats.organizations.total}` : '0 / 0'}
          icon={<CheckCircleIcon />}
          accent="success"
          loading={isLoading}
        />
        <MetricCard
          label="Available Orgs"
          value={stats?.organizations.available ?? 0}
          icon={<SignalIcon />}
          accent="success"
          loading={isLoading}
        />
        <MetricCard
          label="Total Transactions"
          value={stats?.transactions.total ?? 0}
          icon={<ReceiptIcon />}
          loading={isLoading}
        />
        <MetricCard
          label="Total Charged"
          value={formatCents(stats?.revenue.totalChargedCents ?? 0)}
          icon={<DollarIcon />}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
