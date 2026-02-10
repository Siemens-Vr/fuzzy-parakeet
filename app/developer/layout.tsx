'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import '@/styles/developer.css';
import '@/styles/dev.css';

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
        background: '#070A12'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTopColor: '#7c3aed',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has developer profile
  if (!user.developer) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 20
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 40,
            maxWidth: 500,
            textAlign: 'center',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36
          }}>
            🚀
          </div>
          <h1 style={{
            color: '#f8fafc',
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 12
          }}>
            Become a Developer
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 32
          }}>
            Join our developer community and start publishing your VR apps to millions of users worldwide.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/developer/join">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '14px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer'
                }}
              >
                Get Started
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={logout}
              style={{
                width: '100%',
                padding: '14px 28px',
                fontSize: 16,
                fontWeight: 500,
                color: '#94a3b8',
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: 10,
                cursor: 'pointer'
              }}
            >
              Sign out
            </motion.button>
          </div>
          <p style={{
            color: '#64748b',
            fontSize: 13,
            marginTop: 24
          }}>
            Signed in as {user.email}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dev-shell theme-dev">
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
                className="btn btn-primary"
              >
                + New App
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={logout}
              className="btn btn-ghost"
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
          <Link href="/developer/profile">👤 Public Profile</Link>
          <Link href="/developer/settings">⚙️ Settings</Link>
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