'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  price?: number;
};

type FeaturedApp = {
  slug: string;
  name: string;
  tagline: string;
  heroImage: string;
  icon: string;
};

// Mock featured apps for hero carousel
const FEATURED_APPS: FeaturedApp[] = [
  {
    slug: 'guardian-of-realms',
    name: 'Guardian of Realms',
    tagline: 'Guardian of Realms is the first Mixed Reality action RPG',
    heroImage: '/featured/guardian.jpg',
    icon: '/icons/guardian.png',
  },
  {
    slug: 'cyber-drift',
    name: 'Cyber Drift',
    tagline: 'Race through neon-lit cities in immersive VR',
    heroImage: '/featured/cyber-drift.jpg',
    icon: '/icons/cyber-drift.png',
  },
  {
    slug: 'astral-explorer',
    name: 'Astral Explorer',
    tagline: 'Discover the mysteries of deep space',
    heroImage: '/featured/astral.jpg',
    icon: '/icons/astral.png',
  },
];

const SIDEBAR_ITEMS = [
  { icon: '🏠', label: 'Home', href: '/', active: true },
  { icon: '⬇️', label: 'Get SideQuest', href: '/download' },
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

export default function HomePage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthStatus();
    fetchApps();
    
    // Auto-advance carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_APPS.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user/me', { credentials: 'include' });
      setIsLoggedIn(response.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % FEATURED_APPS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + FEATURED_APPS.length) % FEATURED_APPS.length);

  return (
    <div className="app-shell">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="main-content">
        {/* Sign Up Banner */}
        <div className="signup-banner">
          <Link href="/auth/user/register" className="signup-button">
            Sign up now
          </Link>
        </div>

        {/* Hero Carousel */}
        <section className="hero-section">
          <div className="carousel-container">
            {/* Navigation Arrows */}
            <button className="carousel-arrow carousel-arrow-left" onClick={prevSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="carousel-arrow carousel-arrow-right" onClick={nextSlide}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Slides */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="carousel-slide"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <div className="slide-content">
                  <div 
                    className="slide-background"
                    style={{ 
                      backgroundImage: `url(${FEATURED_APPS[currentSlide].heroImage})`,
                      backgroundColor: '#1a1a2e'
                    }}
                  />
                  <div className="slide-overlay" />
                  <div className="slide-info">
                    <h2 className="slide-title">{FEATURED_APPS[currentSlide].name}</h2>
                    <p className="slide-tagline">{FEATURED_APPS[currentSlide].tagline}</p>
                    <div className="slide-actions">
                      <button className="action-btn download-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button className="action-btn play-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                      <button className="action-btn favorite-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Side Preview Cards */}
            <div className="preview-card preview-card-left">
              <div className="preview-content">
                <div className="crystal-icon">💎</div>
              </div>
            </div>
            <div className="preview-card preview-card-right">
              <div className="preview-content">
                <div className="crystal-icon">💎</div>
              </div>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="carousel-dots">
            {FEATURED_APPS.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* Staff Picks Section */}
        <section className="section staff-picks">
          <div className="section-header">
            <div className="section-icon">
              <div className="icon-ring" />
            </div>
            <div className="section-title-group">
              <h2 className="section-title">Latest staff picks</h2>
            </div>
            <button className="scroll-btn scroll-btn-right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="apps-row">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="app-card skeleton">
                  <div className="app-card-image skeleton-image" />
                  <div className="app-card-info">
                    <div className="skeleton-text" />
                    <div className="skeleton-text short" />
                  </div>
                </div>
              ))
            ) : (
              apps.slice(0, 6).map((app, index) => (
                <motion.div
                  key={app.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/apps/${app.slug}`} className="app-card">
                    {index === 0 && <span className="sponsored-badge">Sponsored</span>}
                    <div 
                      className="app-card-image"
                      style={{ 
                        backgroundImage: app.icon ? `url(${app.icon})` : undefined,
                        backgroundColor: !app.icon ? '#2a2a4a' : undefined
                      }}
                    >
                      {!app.icon && <span className="app-placeholder">{app.name[0]}</span>}
                    </div>
                    <div className="app-card-info">
                      <h3 className="app-card-title">{app.name}</h3>
                      {app.price !== undefined && app.price > 0 && (
                        <span className="app-card-price">PAID</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Giveaway Banner */}
        <section className="giveaway-banner">
          <div className="giveaway-content">
            <div className="giveaway-text">
              <span className="giveaway-label">Win:</span>
              <h3 className="giveaway-title">Deadly Delivery</h3>
              <p className="giveaway-entries">736 Entrants</p>
              <p className="giveaway-description">
                Enter now for a chance to win a free copy of the brand new VR co-op horror adventure today! 🎃👻
              </p>
            </div>
            <div className="giveaway-image">
              <div className="giveaway-character">🎮</div>
            </div>
          </div>
        </section>

        {/* All Apps Section */}
        <section className="section all-apps">
          <div className="section-header">
            <h2 className="section-title">Browse All Apps</h2>
          </div>

          {/* Category Pills */}
          <div className="category-pills">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Apps Grid */}
          <div className="apps-grid">
            {apps.map((app, index) => (
              <motion.div
                key={app.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/apps/${app.slug}`} className="app-card-grid">
                  <div 
                    className="app-card-grid-image"
                    style={{ 
                      backgroundImage: app.icon ? `url(${app.icon})` : undefined,
                    }}
                  >
                    {!app.icon && (
                      <div className="app-placeholder-large">{app.name[0]}</div>
                    )}
                    <div className="app-card-overlay">
                      <button className="quick-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="app-card-grid-info">
                    <h3 className="app-card-grid-title">{app.name}</h3>
                    <p className="app-card-grid-developer">{app.developer}</p>
                    <div className="app-card-grid-meta">
                      <span className="app-rating">
                        ⭐ {app.rating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="app-downloads">
                        ⬇️ {app.downloads?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}