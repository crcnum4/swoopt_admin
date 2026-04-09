'use client';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function FilterTabs({ tabs, activeKey, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={
              active
                ? { backgroundColor: '#4B3F72', color: '#ffffff' }
                : { backgroundColor: '#F3F4F6', color: '#4B5563' }
            }
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                style={
                  active
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff' }
                    : { backgroundColor: '#E5E7EB', color: '#6B7280' }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
