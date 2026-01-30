'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { StoreUiProvider, useStoreUi } from '@/contexts/StoreUiContext';
import '@/styles/store.css';

function StoreShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStoreUi();

  return (
    <div className="app-shell theme-store">
      {/* Mobile Menu Overlay (same as original) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`mobile-menu-overlay ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Menu Toggle Button */}
      <motion.button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        whileTap={{ scale: 0.9 }}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? '✕' : '☰'}
      </motion.button>

      {/* Main Content */}
      <div className="main-content">{children}</div>

      {/* Keep your original global style block if you want it global to store */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .mobile-search {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreUiProvider>
      <StoreShell>{children}</StoreShell>
    </StoreUiProvider>
  );
}
