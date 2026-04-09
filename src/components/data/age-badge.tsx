'use client';

import { useState, useEffect } from 'react';

interface AgeBadgeProps {
  createdAt: string;
}

function getAge(createdAt: string): { label: string; color: string } {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let label: string;
  if (days > 0) label = `${days}d ${hours % 24}h`;
  else if (hours > 0) label = `${hours}h ${minutes % 60}m`;
  else label = `${minutes}m`;

  let color: string;
  if (hours >= 4) color = '#EF4444';       // red — urgent
  else if (hours >= 1) color = '#F59E0B';  // amber — warning
  else color = '#10B981';                   // green — fresh

  return { label, color };
}

export function AgeBadge({ createdAt }: AgeBadgeProps) {
  const [age, setAge] = useState(() => getAge(createdAt));

  useEffect(() => {
    const interval = setInterval(() => setAge(getAge(createdAt)), 60_000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: age.color + '15', color: age.color }}
    >
      {age.label}
    </span>
  );
}
