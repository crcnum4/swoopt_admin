'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/requests': 'Service Requests',
  '/requests/support-queue': 'Support Queue',
  '/providers': 'Providers',
  '/providers/onboard': 'Onboard Provider',
  '/users': 'Users',
  '/verification': 'Verification',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/audit-log': 'Audit Log',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Dynamic route patterns
  if (/^\/requests\/[^/]+\/find-provider$/.test(pathname)) return 'Find Provider';
  if (/^\/requests\/[^/]+$/.test(pathname)) return 'Request Detail';
  if (pathname === '/providers/onboard') return 'Onboard Provider';
  if (/^\/providers\/[^/]+$/.test(pathname)) return 'Provider Detail';
  if (/^\/users\/[^/]+$/.test(pathname)) return 'User Detail';

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const parentPath = '/' + segments[0];
    if (PAGE_TITLES[parentPath]) return PAGE_TITLES[parentPath];
  }
  return 'Swoopt Admin';
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: '#4B3F72' }}>{title}</h1>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.email}</span>
        <button
          onClick={logout}
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#FF6B6B' }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
