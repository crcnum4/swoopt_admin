'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

const BRAND = { indigo: '#4B3F72', mint: '#6FFFE9', coral: '#FF6B6B' };

const PRIMARY_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/requests', label: 'Requests', icon: 'inbox' },
  { href: '/requests/support-queue', label: 'Support', icon: 'alert' },
  { href: '/providers', label: 'Providers', icon: 'building' },
];

const MORE_ITEMS = [
  { href: '/users', label: 'Users', icon: 'users' },
  { href: '/verification', label: 'Verification', icon: 'shield' },
  { href: '/transactions', label: 'Transactions', icon: 'dollar' },
  { href: '/analytics', label: 'Analytics', icon: 'chart' },
];

function MobileIcon({ name, size = 22 }: { name: string; size?: number }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case 'inbox': return <svg {...props}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
    case 'alert': return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case 'building': return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" /><line x1="8" y1="6" x2="8" y2="6.01" /><line x1="12" y1="6" x2="12" y2="6.01" /><line x1="16" y1="6" x2="16" y2="6.01" /></svg>;
    case 'users': return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'shield': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>;
    case 'dollar': return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="6" x2="12" y2="18" /><path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" /></svg>;
    case 'chart': return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'more': return <svg {...props}><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="5" r="1" fill="currentColor" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>;
    default: return null;
  }
}

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isMoreActive = MORE_ITEMS.some((item) => isActive(item.href));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 px-2 py-1 min-w-[56px]"
                style={{ color: active ? BRAND.mint : '#9CA3AF' }}
              >
                <MobileIcon name={item.icon} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-2 py-1 min-w-[56px]"
            style={{ color: isMoreActive ? BRAND.mint : '#9CA3AF' }}
          >
            <MobileIcon name="more" />
            <span className="text-[10px] leading-none">More</span>
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-50" onClick={() => setDrawerOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-4">
              <ul className="space-y-1">
                {MORE_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
                        style={active ? { color: BRAND.indigo, backgroundColor: `${BRAND.mint}15`, fontWeight: 500 } : { color: '#4B5563' }}
                      >
                        <MobileIcon name={item.icon} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="px-4 text-xs text-gray-400 truncate">{user?.email}</p>
                <button
                  onClick={() => { setDrawerOpen(false); logout(); }}
                  className="mt-2 px-4 py-2 text-sm font-medium hover:opacity-80"
                  style={{ color: BRAND.coral }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
