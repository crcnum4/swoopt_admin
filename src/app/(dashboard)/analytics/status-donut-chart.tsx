'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatusColor } from '@/lib/utils';

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
};

interface Props {
  byStatus: Record<string, number>;
}

export default function StatusDonutChart({ byStatus }: Props) {
  const data = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: getStatusColor(status).text,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No request data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
