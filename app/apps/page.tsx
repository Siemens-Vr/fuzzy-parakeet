// app/page.tsx
'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AppCard from '@/components/AppCard';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';

const categories = [
  'All apps',
  'Games', 
  'Education',
  'Entertainment',
  'Productivity',
  'Social',
  'Utilities',
  'Medical',
  'Fitness',
  'Adventure',
  'Simulation',
];

type App = {
  slug: string;
  name: string;
  version: string;
  summary?: string;
  description?: string;
  icon?: string;
  screenshots?: string[];
  developer?: string;
  category?: string;
  rating?: number;
  downloads?: number;
  releaseDate?: string;
  lastUpdated?: string;
  sizeBytes?: number;
};

export default function HomePage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All apps');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState('downloads');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user/me', {
        credentials: 'include',
      });
      setIsLoggedIn(response.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // Fetch apps from API
  useEffect(() => {
    fetchApps();
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All apps') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/public/apps?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      } else {
        console.error('Failed to fetch apps');
        setApps([]);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Home', href: '/', active: true },
  { icon: '⬇️', label: 'Get VR APP STORE', href: '/download' },
  { icon: '🎮', label: 'Apps and Games', href: '/apps' },
  { icon: '👥', label: 'Groups', href: '/groups' },
  { icon: '⚡', label: 'Indie Alliance', href: '/indie' },
  { icon: '⭐', label: 'Advertise', href: '/advertise' },
  { icon: '📰', label: 'Articles', href: '/articles', badge: 'New!' },
  { icon: '❓', label: 'Help & Support', href: '/support' },
];

const CATEGORIES = [
  'All', 'Games', 'Education', 'Entertainment', 'Productivity', 
  'Social', 'Utilities', 'Fitness', 'Medical', 'Adventure'
];


  return (
    <div className='app-shell'>
  
        <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="logo">
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
              placeholder="Search VR Store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/developer" className="footer-link">Developer Portal</Link>
          <Link href="/feedback" className="footer-link">Give us feedback</Link>
          <Link href="/about" className="footer-link">About VR Store</Link>
        </div>

        {/* Promo Card */}
        <div className="promo-card">
          <p className="promo-text">Looking for some</p>
          <h3 className="promo-title">Physics fueled<br/>fun with friends?</h3>
          <div className="promo-image">🤖</div>
        </div>

        {/* Auth Section */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <span>My account</span>
            </div>
          ) : (
            <Link href="/auth/user/login" className="login-button">
              <div className="login-avatar">🎮</div>
              <div className="login-text">
                <span className="login-title">Log in or Sign up</span>
                <span className="login-subtitle">My account</span>
              </div>
            </Link>
          )}
        </div>
      </aside>
     
      <div className='main-content'>
          {/* Hero Carousel */}
          <HeroCarousel />

          {/* Main Content */}
          <div style={{ padding: '0 2rem' }}>
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="🔍 Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '2px solid var(--border)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </motion.div>

            {/* Category Filters */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="category-filters"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  variants={categoryVariants}
                  whileHover={{ 
                    scale: 1.08,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>

            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="page-header"
            >
              <h1 className="page-title">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Browse EVERYTHING!
                </motion.span>
                {' '}
                <motion.span 
                  className="page-subtitle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  - from rated hard to hardly rated
                </motion.span>
              </h1>
            </motion.div>

            {/* Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="filter-bar"
            >
              <motion.select 
                className="filter-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="name">Name (A-Z)</option>
              </motion.select>
              
              <motion.label 
                className="filter-toggle"
                whileHover={{ scale: 1.02 }}
              >
                <input 
                  type="checkbox" 
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                />
                Free apps only
              </motion.label>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: '0.875rem 1.5rem',
                      borderRadius: '10px',
                      border: '2px solid #0066cc',
                      background: 'white',
                      color: '#0066cc',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    🚀 Developer Portal
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 50,
                    height: 50,
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#0066cc',
                    borderRadius: '50%',
                    margin: '0 auto 20px'
                  }}
                />
                <p style={{ color: '#64748b' }}>Loading apps...</p>
              </div>
            )}

            {/* Apps Grid */}
            {!loading && apps.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="app-grid"
              >
                {apps.map((app, index) => (
                  <motion.div
                    key={app.slug}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    <AppCard app={app as any} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && apps.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '4rem',
                  background: 'var(--surface)',
                  borderRadius: '16px',
                  margin: '2rem 0'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📱</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No apps found
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Try adjusting your filters or search query
                </p>
              </motion.div>
            )}
          </div>
      </div>
    </div>
    
  );
}