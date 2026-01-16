'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type StoreUiContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  searchQuery: string;
  setSearchQuery: (v: string) => void;
};

const StoreUiContext = createContext<StoreUiContextValue | null>(null);

export function StoreUiProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll when sidebar is open (mobile)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery }),
    [sidebarOpen, searchQuery]
  );

  return <StoreUiContext.Provider value={value}>{children}</StoreUiContext.Provider>;
}

export function useStoreUi() {
  const ctx = useContext(StoreUiContext);
  if (!ctx) throw new Error('useStoreUi must be used within StoreUiProvider');
  return ctx;
}
