'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AppCard, { type AppMeta } from '@/components/AppCard';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';
import CategoryBrowse from '@/components/CategoryBrowse';
import { useStoreUi } from '@/contexts/StoreUiContext';

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

export default function HomePage() {
  const { searchQuery } = useStoreUi(); // ✅ from Sidebar now

  const [apps, setApps] = useState<AppMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All apps');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState('downloads');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Fetch apps from API (same dependencies as original + freeOnly)
  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, searchQuery, freeOnly]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All apps') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortBy', sortBy);
      if (freeOnly) params.append('freeOnly', 'true');

      const response = await fetch(`/api/public/apps?${params.toString()}`);
      if (!response.ok) {
        console.error('Failed to fetch apps');
        setApps([]);
        return;
      }

      const data = await response.json();

      // ✅ map -> AppMeta for AppCard
      const mapped: AppMeta[] = (Array.isArray(data) ? data : []).map((app: any) => ({
        slug: app.slug,
        name: app.name,
        version: app.version ?? '1.0.0',
        filename: app.filename ?? '',
        sizeBytes: app.sizeBytes ?? 0,
        sha256: app.sha256 ?? '',
        summary: app.summary,
        description: app.description,
        icon: app.icon,
        screenshots: app.screenshots,
        developer: app.developer,
        category: app.category,
        rating: app.rating,
        downloads: app.downloads,
        releaseDate: app.releaseDate,
        lastUpdated: app.lastUpdated,
      }));

      setApps(mapped);
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
        delayChildren: 0.2,
      },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel />

      <div >
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 40,
                height: 40,
                border: '4px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>Loading apps...</p>
          </div>
        )}

        {/* Apps Grid */}
        {!loading && apps.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="app-grid">
            {apps.map((app, index) => (
              <motion.div
                key={app.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 100,
                }}
              >
                <AppCard app={app} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && apps.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No apps found</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search query</p>
          </motion.div>
        )}
      </div>

      {/* CategoryBrowse (same as original position) */}
      <div>
        <CategoryBrowse selectedCategory={selectedCategory} onCategorySelect={handleCategorySelect} />
      </div>
    </div>
  );
}
