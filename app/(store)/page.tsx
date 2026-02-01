'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AppCard, { type AppMeta } from '@/components/AppCard';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryBrowse from '@/components/CategoryBrowse';
import AppShelf from '@/components/AppShelf';
import ArticleShelf from '@/components/ArticleShelf';
import DiscoveryGrid from '@/components/DiscoveryGrid';
import PromoBanner from '@/components/PromoBanner';
import SideloadShelf from '@/components/SideloadShelf';
import StoreFooter from '@/components/layout/StoreFooter';
import { useStoreUi } from '@/contexts/StoreUiContext';

export default function HomePage() {
  const { searchQuery } = useStoreUi();

  const [apps, setApps] = useState<AppMeta[]>([]);
  const [trendingApps, setTrendingApps] = useState<AppMeta[]>([]);
  const [newApps, setNewApps] = useState<AppMeta[]>([]);
  const [experimentalApps, setExperimentalApps] = useState<AppMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [shelvesLoading, setShelvesLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All apps');
  const [sortBy, setSortBy] = useState('downloads');

  // Fetch specialized collections on mount
  useEffect(() => {
    fetchCollections();
  }, []);

  // Fetch filtered apps when criteria change
  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchCollections = async () => {
    setShelvesLoading(true);
    try {
      // Fetch Trending (Sort by downloads)
      const trendingRes = await fetch('/api/public/apps?sortBy=downloads&limit=10');
      const trendingData = await trendingRes.json();

      // Fetch New (Sort by releaseDate)
      const newRes = await fetch('/api/public/apps?sortBy=releaseDate&limit=10');
      const newData = await newRes.json();

      // Fetch Experimental (Simulated for now with 'Utilities' or just a subset)
      const experimentalRes = await fetch('/api/public/apps?limit=8');
      const experimentalData = await experimentalRes.json();

      setTrendingApps(mapApps(trendingData));
      setNewApps(mapApps(newData));
      setExperimentalApps(mapApps(experimentalData));
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setShelvesLoading(false);
    }
  };

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All apps') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/public/apps?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setApps(mapApps(data));
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const mapApps = (data: any[]): AppMeta[] => {
    return (Array.isArray(data) ? data : []).map((app: any) => ({
      slug: app.slug,
      name: app.name,
      icon: app.icon,
      summary: app.summary,
      developer: app.developer,
      category: app.category,
      rating: app.rating,
      downloads: app.downloads,
    } as AppMeta));
  };

  const isDiscoveryMode = !searchQuery && selectedCategory === 'All apps';

  return (
    <div className="home-container">
      <HeroCarousel />

      <div className="home-sections">
        {isDiscoveryMode ? (
          <>
            <AppShelf
              title="Trending Games"
              apps={trendingApps}
              loading={shelvesLoading}
              viewAllHref="/apps?sortBy=downloads"
            />

            <DiscoveryGrid />

            <AppShelf
              title="New Releases"
              apps={newApps}
              loading={shelvesLoading}
              viewAllHref="/apps?sortBy=releaseDate"
            />

            <PromoBanner />

            <SideloadShelf
              apps={experimentalApps}
              loading={shelvesLoading}
            />

            <ArticleShelf />

            <div className="section-divider" />

            <header className="section-header-centered">
              <h2 className="section-title">Browse All Apps</h2>
              <p className="section-subtitle">Explore our full library of VR experiences</p>
            </header>
          </>
        ) : (
          <header className="results-header">
            <h2 className="section-title">
              {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory}
            </h2>
            <p className="section-subtitle">{apps.length} apps found</p>
          </header>
        )}

        {/* Main Grid Area */}
        <div className="main-grid-area">
          {loading ? (
            <div className="loading-spinner">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="spinner"
              />
            </div>
          ) : apps.length > 0 ? (
            <motion.div
              className="app-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {apps.map((app, index) => (
                <motion.div
                  key={app.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AppCard app={app} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <h2>No apps found</h2>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <CategoryBrowse
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <StoreFooter />
    </div>
  );
}
