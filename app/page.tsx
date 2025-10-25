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

  return (
    <div>
      {/* Auth Status Banner */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #0066cc, #00b894)',
            color: 'white',
            padding: '12px 24px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          📱 Sign in to download apps{' '}
          <Link href="/auth/user/login" style={{ color: 'white', textDecoration: 'underline', marginLeft: '8px' }}>
            Login here
          </Link>
        </motion.div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link href="/" className="header-logo">
            <span className="logo-icon">🎮</span>
            <span>VR App Store</span>
          </Link>
          <nav className="header-nav">
            {isLoggedIn ? (
              <>
                <span>Welcome! 👋</span>
                <Link href="/api/auth/user/logout" style={{ fontWeight: 600, color: '#0066cc' }}>
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/user/login" style={{ fontWeight: 600 }}>
                  Sign In
                </Link>
                <Link href="/auth/user/register" style={{ 
                  background: 'linear-gradient(135deg, #0066cc, #00b894)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600
                }}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

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
  );
}