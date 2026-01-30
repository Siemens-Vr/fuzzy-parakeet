'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStoreUi } from '@/contexts/StoreUiContext';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Home', href: '/' },
  { icon: '⬇️', label: 'Get VR APP STORE', href: '/download' },
  { icon: '🎮', label: 'Apps and Games', href: '/apps' },
  { icon: '👥', label: 'Groups', href: '/groups' },
  { icon: '⚡', label: 'Indie Alliance', href: '/indie' },
  { icon: '⭐', label: 'Advertise', href: '/advertise' },
  { icon: '📰', label: 'Articles', href: '/articles', badge: 'New!' },
  { icon: '❓', label: 'Help & Support', href: '/support' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery } = useStoreUi();
  const { user, loading } = useAuth();

  const isLoggedIn = !!user;

  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <aside className={`vr-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link href="/" className="logo" onClick={closeOnMobile}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="logo-text">VR STORE</span>
        </Link>
      </div>

      <div className="search-container">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="vr-input search-input"
            placeholder="Search VR Store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        {SIDEBAR_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? 'is-active' : ''}`}
              onClick={closeOnMobile}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/developer" className="footer-link" onClick={closeOnMobile}>
          Developer Portal
        </Link>
        <Link href="/feedback" className="footer-link" onClick={closeOnMobile}>
          Give us feedback
        </Link>
        <Link href="/about" className="footer-link" onClick={closeOnMobile}>
          About VR Store
        </Link>
      </div>

      <div className="promo-card">
        <p className="promo-text">Looking for some</p>
        <h3 className="promo-title">Physics fueled<br />fun with friends?</h3>
        <div className="promo-image">🤖</div>
      </div>

      <div className="auth-section">
        {loading ? (
          <div className="user-info">
            <div className="user-avatar">⏳</div>
            <span>Loading...</span>
          </div>
        ) : isLoggedIn ? (
          <Link href="/account" className="login-button" onClick={closeOnMobile}>
            <div className="login-avatar">👤</div>
            <div className="login-text">
              <span className="login-title">{user?.name || 'My account'}</span>
              <span className="login-subtitle">Account</span>
            </div>
          </Link>
        ) : (
          <Link href="/auth/user/login" className="login-button" onClick={closeOnMobile}>
            <div className="login-avatar">🎮</div>
            <div className="login-text">
              <span className="login-title">Log in or Sign up</span>
              <span className="login-subtitle">My account</span>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
}
