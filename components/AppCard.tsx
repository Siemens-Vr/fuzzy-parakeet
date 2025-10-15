'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

type AppMeta = {
  slug: string;
  name: string;
  version: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
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
};

export default function AppCard({ app }: { app: AppMeta }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/api/download/${app.slug}`;
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/apps/${app.slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        {/* Card Image */}
        <div className="card-image-wrapper">
          <img
            src={app.icon || app.screenshots?.[0] || '/placeholder.jpg'}
            alt={app.name}
            className="card-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'block';
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)" /%3E%3C/svg%3E';
            }}
          />
          
          {/* Rating Badge */}
          {app.rating && (
            <div className="card-rating">
              <span>⭐</span>
              <span>{app.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Hover Actions */}
          <div className="card-actions">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="card-action-btn download"
              aria-label="Download"
            >
              ⬇️
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className="card-action-btn favorite"
              aria-label="Favorite"
            >
              {isFavorite ? '❤️' : '🤍'}
            </motion.button>
          </div>
        </div>

        {/* Card Content */}
        <div className="card-content">
          <div className="card-title">{app.name}</div>
          <div className="card-meta-row">
            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
              FREE
            </span>
            <span>
              {app.downloads ? `${Math.floor(app.downloads / 1000)}k` : '0'} Reviews
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}