'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/styles/developer.css';

const NAV = [
  { href: '/developer', label: 'Dashboard', icon: '📊' },
  { href: '/developer/apps/new', label: 'Submit App', icon: '📤' },
  { href: '/developer/builds', label: 'Builds', icon: '🔨' },
  { href: '/developer/payouts', label: 'Payouts', icon: '💳' },
  { href: '/developer/profile', label: 'Profile', icon: '👤' },
];

export default function DeveloperLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dev-shell">
      {/* Topbar */}
      <div className="dev-topbar">
        <div className="dev-topbar-inner">
          <div className="dev-brand">
            <span className="dev-brand-logo" />
            <span>Developer Portal</span>
          </div>
          <div>
            <Link href="/developer/apps/new" className="btn-primary" style={{marginRight:8}}>New app</Link>
            <button className="btn-ghost">Logout</button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="dev-sidebar">
        <div className="dev-sidebar-header">Meta-style Console</div>
        <nav className="dev-nav">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={pathname === n.href ? 'active' : ''}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="dev-content">
        <div className="dev-container">{children}</div>
      </main>
    </div>
  );
}
