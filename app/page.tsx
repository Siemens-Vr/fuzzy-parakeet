'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
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

];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All apps');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Hot');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

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
      {/* Hero Banner with Parallax */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="hero-banner"
      >
        <motion.img 
          style={{ scale: heroScale }}
          src="/hero-banner.jpg" 
          alt="VR Experience"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
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
          <option>Hot</option>
          <option>New</option>
          <option>Top Rated</option>
          <option>Most Downloaded</option>
        </motion.select>
        
        <motion.button 
          className="filter-dropdown"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Advanced Filters
        </motion.button>

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

        <div style={{ marginLeft: 'auto' }}>
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 12px 24px rgba(30, 64, 175, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: 'white',
              padding: '0.875rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              style={{ display: 'inline-block' }}
            >
              🏆 Check out THE GOAT VR Games!
            </motion.span>
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
    </div>
  );
}