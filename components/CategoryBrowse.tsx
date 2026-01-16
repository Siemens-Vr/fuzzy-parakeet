'use client';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { LeftArrow, RightArrow } from './Navigationarrows'

// Category data with images - add your own images to public/categories/
const categories = [
  { id: 'all', name: 'All apps', image: '/categories/all-apps.png', color: '#6366f1' },
  { id: 'adventure', name: 'Adventure', image: '/categories/Adventure.png', color: '#8b5cf6' },
  { id: 'building', name: 'Building', image: '/categories/Building.png', color: '#ec4899' },
  { id: 'climbing', name: 'Climbing', image: '/categories/Education.png', color: '#f97316' },
  { id: 'combat', name: 'Combat', image: '/categories/combat.jpg', color: '#ef4444' },
  { id: 'custom-homes', name: 'Custom homes', image: '/categories/custom-homes.jpg', color: '#f472b6' },
  { id: 'early-access', name: 'Early access', image: '/categories/early-access.jpg', color: '#a855f7' },
  { id: 'educational', name: 'Educational', image: '/categories/educational.jpg', color: '#3b82f6' },
  { id: 'escape-room', name: 'Escape room', image: '/categories/escape-room.jpg', color: '#14b8a6' },
  { id: 'fitness', name: 'Fitness', image: '/categories/fitness.jpg', color: '#22c55e' },
//   { id: 'flying', name: 'Flying', image: '/categories/flying.jpg', color: '#0ea5e9' },
//   { id: 'hand-tracking', name: 'Hand tracking', image: '/categories/hand-tracking.jpg', color: '#06b6d4' },
//   { id: 'horror', name: 'Horror', image: '/categories/horror.jpg', color: '#991b1b' },
//   { id: 'meditation', name: 'Meditation', image: '/categories/meditation.jpg', color: '#7c3aed' },
//   { id: 'multiplayer', name: 'Multiplayer', image: '/categories/multiplayer.jpg', color: '#2563eb' },
//   { id: 'music', name: 'Music', image: '/categories/music.jpg', color: '#db2777' },
//   { id: 'puzzle', name: 'Puzzle', image: '/categories/puzzle.jpg', color: '#059669' },
//   { id: 'shooter', name: 'Shooter', image: '/categories/shooter.jpg', color: '#dc2626' },
//   { id: 'social', name: 'Social', image: '/categories/social.jpg', color: '#7c3aed' },
//   { id: 'sports', name: 'Sports', image: '/categories/sports.jpg', color: '#16a34a' },
];

interface CategoryBrowseProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

export default function CategoryBrowse({ onCategorySelect, selectedCategory = 'all' }: CategoryBrowseProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Scroll by ~2 cards
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <section className="category-browse-section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="category-browse-header"
      >
        <h2 className="category-browse-title">Browse by Category</h2>
      </motion.div>

      <div className="category-browse-container">
        {/* Reusable Left Arrow */}
        <LeftArrow
          onClick={() => scroll('left')}
          visible={showLeftArrow}
          size="sm"
          variant="minimal"
          offset="0"
        />

        {/* Scrollable Categories Container */}
        <div 
          ref={scrollContainerRef}
          className="category-scroll-container"
          onScroll={checkScrollPosition}
        >
          <motion.div 
            className="category-cards-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.25, ease: 'easeOut' }
                }}
                onHoverStart={() => setHoveredCategory(category.id)}
                onHoverEnd={() => setHoveredCategory(null)}
                onClick={() => handleCategoryClick(category.id)}
              >
                <Link href={`/apps?category=${category.id}`} className="category-card-link">
                  {/* Card Background Image */}
                  <div className="category-card-image-container">
                    <div 
                      className="category-card-image"
                      style={{ 
                        backgroundImage: `url(${category.image})`,
                        backgroundColor: category.color 
                      }}
                    />
                    {/* Gradient Overlay */}
                    <div className="category-card-overlay" />
                    
                    {/* Selection Indicator Dot */}
                    {(selectedCategory === category.id || hoveredCategory === category.id) && (
                      <motion.div 
                        className="category-indicator-dot"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ backgroundColor: '#f472b6' }}
                      />
                    )}
                  </div>

                  {/* Category Name */}
                  <motion.span 
                    className="category-card-name"
                    animate={{
                      color: hoveredCategory === category.id ? '#fff' : 'rgba(255,255,255,0.9)'
                    }}
                  >
                    {category.name}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Reusable Right Arrow */}
        <RightArrow
          onClick={() => scroll('right')}
          visible={showRightArrow}
          size="sm"
          variant="minimal"
          offset="0"
        />
      </div>

      <style jsx global>{`
        .category-browse-section {
          padding: 2rem 0 3rem;
          position: relative;
        }

        .category-browse-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding: 0 1rem;
        }

        .category-browse-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .category-browse-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .category-scroll-container {
          overflow-x: auto;
          overflow-y: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0.5rem 1rem 1rem;
          margin: -0.5rem 0;
        }

        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .category-cards-wrapper {
          display: flex;
          gap: 1rem;
          padding-right: 2rem;
        }

        .category-card {
          flex-shrink: 0;
          width: 140px;
          cursor: pointer;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .category-card:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .category-card.selected {
          box-shadow: 0 0 0 2px #f472b6, 0 12px 40px rgba(244, 114, 182, 0.3);
        }

        .category-card-link {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }

        .category-card-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
        }

        .category-card-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: transform 0.4s ease;
        }

        .category-card:hover .category-card-image {
          transform: scale(1.08);
        }

        .category-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 40%,
            rgba(0, 0, 0, 0.4) 70%,
            rgba(0, 0, 0, 0.6) 100%
          );
          pointer-events: none;
        }

        .category-indicator-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(244, 114, 182, 0.8);
        }

        .category-card-name {
          display: block;
          padding: 0.75rem 0.25rem 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
          transition: color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Navigation Arrows */
        .category-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(30, 30, 35, 0.95);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, background-color 0.2s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }

        .category-nav-arrow.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .category-nav-arrow:hover {
          background: rgba(50, 50, 60, 0.98);
        }

        .category-nav-left {
          left: 0;
        }

        .category-nav-right {
          right: 0;
        }

        /* Fade edges for scroll indication */
        .category-browse-container::before,
        .category-browse-container::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          pointer-events: none;
          z-index: 5;
        }

        .category-browse-container::before {
          left: 0;
          background: linear-gradient(90deg, var(--background, #0f0f12) 0%, transparent 100%);
        }

        .category-browse-container::after {
          right: 0;
          background: linear-gradient(-90deg, var(--background, #0f0f12) 0%, transparent 100%);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .category-browse-title {
            font-size: 1.25rem;
          }

          .category-card {
            width: 120px;
          }

          .category-nav-arrow {
            display: none;
          }

          .category-browse-container::before,
          .category-browse-container::after {
            width: 30px;
          }
        }

        @media (max-width: 480px) {
          .category-browse-section {
            padding: 1.5rem 0 2rem;
          }

          .category-card {
            width: 100px;
          }

          .category-card-name {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}