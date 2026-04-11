'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useExhaustedCount } from '@/lib/hooks/use-exhausted-count';

const BRAND = {
  indigo: '#4B3F72',
  mint: '#6FFFE9',
  coral: '#FF6B6B',
};

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/requests', label: 'Requests', icon: 'inbox' },
  { href: '/requests/support-queue', label: 'Support Queue', icon: 'alert' },
  { href: '/providers', label: 'Providers', icon: 'building' },
  { href: '/users', label: 'Users', icon: 'users' },
  { href: '/verification', label: 'Verification', icon: 'shield' },
  { href: '/transactions', label: 'Transactions', icon: 'dollar' },
  { href: '/analytics', label: 'Analytics', icon: 'chart' },
  { href: '/audit-log', label: 'Audit Log', icon: 'clipboard' },
];

function NavIcon({ name }: { name: string }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'shrink-0',
  };

  switch (name) {
    case 'grid':
      return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case 'inbox':
      return <svg {...props}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
    case 'alert':
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case 'building':
      return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" /><line x1="8" y1="6" x2="8" y2="6.01" /><line x1="12" y1="6" x2="12" y2="6.01" /><line x1="16" y1="6" x2="16" y2="6.01" /><line x1="8" y1="10" x2="8" y2="10.01" /><line x1="12" y1="10" x2="12" y2="10.01" /><line x1="16" y1="10" x2="16" y2="10.01" /></svg>;
    case 'users':
      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>;
    case 'dollar':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="6" x2="12" y2="18" /><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" /></svg>;
    case 'chart':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'clipboard':
      return <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" /></svg>;
    default:
      return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { data: exhaustedCount = 0 } = useExhaustedCount();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const width = collapsed ? 64 : 256;

  return (
    <aside
      className="hidden md:flex flex-col bg-white border-r border-gray-200 h-full shrink-0"
      style={{ width, minWidth: width, transition: 'width 150ms ease' }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {collapsed ? (
          <span className="text-xl font-bold mx-auto" style={{ color: BRAND.indigo }}>S</span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold" style={{ color: BRAND.indigo }}>Swoopt</span>
            <span className="text-xs text-gray-400">Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {collapsed ? <polyline points="6 3 11 8 6 13" /> : <polyline points="10 3 5 8 10 13" />}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    active ? 'font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={active ? { color: BRAND.indigo, backgroundColor: `${BRAND.mint}15`, borderLeft: `3px solid ${BRAND.mint}` } : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="relative">
                    <NavIcon name={item.icon} />
                    {collapsed && item.href === '/requests/support-queue' && exhaustedCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: BRAND.coral }}
                      >
                        {exhaustedCount > 9 ? '9+' : exhaustedCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between truncate">
                      {item.label}
                      {item.href === '/requests/support-queue' && exhaustedCount > 0 && (
                        <span
                          className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
                          style={{ backgroundColor: BRAND.coral }}
                        >
                          {exhaustedCount}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        {collapsed ? (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-400"
            title="Sign out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <>
            <p className="text-xs text-gray-400 truncate mb-1">{user?.email}</p>
            <button
              onClick={logout}
              className="text-xs font-medium hover:opacity-80 transition-opacity"
              style={{ color: BRAND.coral }}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
