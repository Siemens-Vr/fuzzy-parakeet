// app/page.tsx
'use client';
import { motion,  AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import AppCard from '@/components/AppCard';
import Image from 'next/image';
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
   const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
   const [isHoveringRight, setIsHoveringRight] = useState(false);



  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  };
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % categories.length);
 
  

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



const CATEGORIES = [
  'All', 'Games', 'Education', 'Entertainment', 'Productivity', 
  'Social', 'Utilities', 'Fitness', 'Medical', 'Adventure'
];


  return (
      <div >
         {/* Main Content */}
          <div style={{  }}>
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
          

       



            {/* Triple Image Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.01 }}
              style={{
                margin: '1rem 0 1.6rem',
                height: 'clamp(200px, 22vw, 340px)',
                borderRadius: '18px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                position: 'relative',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Background image */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('/hero/bg.webp')`, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'scale(1.1)',
                  zIndex: 0
                }}
              />


              {/* Image 1 */}
              <div style={{ position: 'relative' }}>
                <Image
                  src="/hero/left.webp"
                  alt="Featured VR Character Left"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              {/* Image 2 (center – visual anchor) */}
              <div style={{ position: 'relative' }}>
                <Image
                  src="/hero/center-image.webp"
                  alt="Featured VR Character Center"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              {/* Image 3 */}
              <div style={{ position: 'relative' }}>
                <Image
                  src="/hero/right-image.webp"
                  alt="Featured VR Character Right"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              {/* Unified cinematic overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 100%)',
                  pointerEvents: 'none'
                }}
              />

              {/* Optional text */}
              <div
                style={{
                  position: 'absolute',
                  left: 'clamp(16px, 2.5vw, 28px)',
                  bottom: 'clamp(16px, 2.5vw, 28px)',
                  color: 'white',
                  maxWidth: '60%'
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(1.1rem, 2.4vw, 1.8rem)',
                    fontWeight: 800,
                    textShadow: '0 4px 14px rgba(0,0,0,0.9)'
                  }}
                >
                  Legendary Worlds. One Store.
                </div>
                <div
                  style={{
                    opacity: 0.9,
                    fontSize: 'clamp(0.85rem, 1.6vw, 1rem)'
                  }}
                >
                  Explore cinematic VR experiences, games and simulations.
                </div>
              </div>
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
                <option value="name">Name (A-Z)</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              
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