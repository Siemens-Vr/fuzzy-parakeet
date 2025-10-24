'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import '@/styles/developer.css';

function DeveloperLayoutInner({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f8fa'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dev-shell">
      {/* Topbar */}
      <div className="dev-topbar">
        <div className="dev-topbar-inner">
          <div className="dev-brand">
            <span className="dev-brand-logo" />
            <div>
              <div style={{ fontWeight: 700 }}>Developer Portal</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{user.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/developer/apps/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="btn-primary"
              >
                + New App
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={logout}
              className="btn-ghost"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="dev-sidebar">
        <div className="dev-sidebar-header">Navigation</div>
        <nav className="dev-nav">
          <Link href="/developer">📊 Dashboard</Link>
          <Link href="/developer/apps/new">📤 Submit App</Link>
          <Link href="/developer/builds">🔨 Builds</Link>
          <Link href="/developer/payouts">💳 Payouts</Link>
          <Link href="/developer/profile">👤 Profile</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="dev-content">
        <div className="dev-container">{children}</div>
      </main>
    </div>
  );
}

export default function DeveloperLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DeveloperLayoutInner>{children}</DeveloperLayoutInner>
    </AuthProvider>
  );
}