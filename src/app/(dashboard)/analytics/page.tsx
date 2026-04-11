'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useDashboardStats } from '@/lib/hooks/use-dashboard-stats';
import { MetricCard } from '@/components/data/metric-card';
import { FilterTabs } from '@/components/data/filter-tabs';
import { formatCents, getStatusColor } from '@/lib/utils';

// Lazy-load Recharts to avoid bundle bloat on other pages
const StatusDonutChart = dynamic(() => import('./status-donut-chart'), { ssr: false });

const RANGE_TABS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
];

const iconProps = {
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

function UsersIcon() {
  return <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function BuildingIcon() {
  return <svg {...iconProps}><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22V12h6v10" /><path d="M8 6h.01" /><path d="M16 6h.01" /></svg>;
}
function InboxIcon() {
  return <svg {...iconProps}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}
function ReceiptIcon() {
  return <svg {...iconProps}><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" /><path d="M8 10h8" /><path d="M8 14h4" /></svg>;
}
function DollarIcon() {
  return <svg {...iconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

function PlaceholderChart({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#4B3F72' }}>{title}</h3>
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-400">Time-series data coming in a future update</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4B3F72' }}>Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Platform metrics and insights</p>
        </div>
        <FilterTabs tabs={RANGE_TABS} activeKey={range} onChange={setRange} />
      </div>

      {/* KPI Row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Total Users" value={stats?.users.total ?? 0} icon={<UsersIcon />} loading={isLoading} />
        <MetricCard label="Total Orgs" value={stats?.organizations.total ?? 0} icon={<BuildingIcon />} loading={isLoading} />
        <MetricCard label="Total Requests" value={stats?.serviceRequests.total ?? 0} icon={<InboxIcon />} loading={isLoading} />
        <MetricCard label="Total Transactions" value={stats?.transactions.total ?? 0} icon={<ReceiptIcon />} loading={isLoading} />
        <MetricCard label="Platform Revenue" value={formatCents(stats?.revenue.totalPlatformFeeCents ?? 0)} icon={<DollarIcon />} loading={isLoading} />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Donut */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#4B3F72' }}>Request Status Breakdown</h3>
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
          ) : stats ? (
            <StatusDonutChart byStatus={stats.serviceRequests.byStatus} />
          ) : null}
        </div>

        {/* Revenue KPIs */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#4B3F72' }}>Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Charged</span>
              <span className="text-lg font-bold" style={{ color: '#4B3F72' }}>{formatCents(stats?.revenue.totalChargedCents ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Platform Fees</span>
              <span className="text-lg font-bold" style={{ color: '#0D7377' }}>{formatCents(stats?.revenue.totalPlatformFeeCents ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Total Payouts</span>
              <span className="text-lg font-bold text-gray-700">{formatCents(stats?.revenue.totalPayoutCents ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder charts for time-series */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlaceholderChart title="Request Volume Over Time" />
        <PlaceholderChart title="Offer Acceptance Rate" />
        <PlaceholderChart title="User & Org Growth" />
        <PlaceholderChart title="Denial Reason Breakdown" />
      </div>
    </div>
  );
}
