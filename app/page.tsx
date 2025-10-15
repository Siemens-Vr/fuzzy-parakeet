'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import apps from '@/data/apps.json';
import AppCard from '@/components/AppCard';

const categories = [
  'All apps',
  'Explore', 
  'Adventure',
  'App Lab',
  'Building',
  'Climbing',
  'Combat',
  'Custom homes',
  'Early access',
  'Educational',
  'Escape room',
  'Flying',
  'Fitness',
  'Hand tracking',
  'Horror',
  'Meditation',
  'Multiplayer',
  'Music'
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All apps');
  const [freeOnly, setFreeOnly] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hero-banner"
      >
        <img 
          src="/hero-banner.jpg" 
          alt="Hero Banner"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="category-filters"
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="page-header"
      >
        <h1 className="page-title">
          <span style={{ color: 'var(--accent-pink)' }}>Browse EVERYTHING!</span>
          {' '}<span className="page-subtitle">- from rated hard to hardly rated</span>
        </h1>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="filter-bar"
      >
        <select className="filter-dropdown">
          <option>Hot</option>
          <option>New</option>
          <option>Top Rated</option>
          <option>Most Downloaded</option>
        </select>
        
        <button className="filter-dropdown">
          Advanced Filters
        </button>

        <label className="filter-toggle">
          <input 
            type="checkbox" 
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          Free apps only
        </label>

        <div style={{ marginLeft: 'auto' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--accent-purple) 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Check out THE GOAT VR Games!
          </motion.button>
        </div>
      </motion.div>

      {/* Apps Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="app-grid"
      >
        {apps.map((app) => (
          <AppCard key={app.slug} app={app as any} />
        ))}
      </motion.div>
    </div>
  );
}