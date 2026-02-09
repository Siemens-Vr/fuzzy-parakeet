'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export type AppMeta = {
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
  tags?: string[];
  rating?: number;
  downloads?: number;
  releaseDate?: string;
  lastUpdated?: string;
  trailerVideoUrl?: string;
};

// Premium ease-out curve matching SideQuest feel
const SQ_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SQ_DURATION = 0.32; // 320ms

export default function AppCard({ app }: { app: AppMeta }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setIsHovered(true);
    if (app.trailerVideoUrl && videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Build tags display
  const allTags = app.tags && app.tags.length > 0
    ? app.tags
    : app.category
      ? [app.category.charAt(0) + app.category.slice(1).toLowerCase().replace(/_/g, ' ')]
      : [];
  const shownTags = allTags.slice(0, 2);
  const remainingCount = Math.max(0, allTags.length - 2);

  return (
    <Link href={`/apps/${app.slug}`} style={{ textDecoration: 'none' }}>
      <motion.div
        className="sq-card"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: SQ_EASE }}
      >
        {/* ─── Media Area ─── */}
        <div className="sq-card-media">
          {/* Poster / Static Image */}
          {!imageLoaded && (
            <div className="sq-card-skeleton" />
          )}
          <motion.img
            src={app.icon || app.screenshots?.[0] || '/placeholder.jpg'}
            alt={app.name}
            className="sq-card-poster"
            initial={{ opacity: 0 }}
            animate={{
              opacity: imageLoaded ? 1 : 0,
              scale: isHovered ? 1.02 : 1,
              filter: isHovered ? 'brightness(0.6)' : 'brightness(1)',
            }}
            transition={{ duration: SQ_DURATION, ease: SQ_EASE }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231e40af"%3E%3C/stop%3E%3Cstop offset="100%25" style="stop-color:%23059669"%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23g)"%3E%3C/rect%3E%3C/svg%3E';
              setImageLoaded(true);
            }}
          />

          {/* Video Preview Layer */}
          {app.trailerVideoUrl && (
            <motion.div
              className="sq-card-video-layer"
              style={{ transformOrigin: 'bottom center' }}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 16,
                scale: isHovered ? 1 : 0.97,
              }}
              transition={{ duration: SQ_DURATION, ease: SQ_EASE }}
            >
              <video
                ref={videoRef}
                src={app.trailerVideoUrl}
                muted
                loop
                playsInline
                preload="metadata"
              />
            </motion.div>
          )}

          {/* Bottom gradient overlay — strengthens on hover */}
          <motion.div
            className="sq-card-gradient"
            animate={{
              opacity: isHovered ? 1 : 0.65,
            }}
            transition={{ duration: SQ_DURATION, ease: SQ_EASE }}
          />

          {/* Rating Badge */}
          {app.rating != null && app.rating > 0 && (
            <div className="sq-card-rating">
              ⭐ {app.rating.toFixed(1)}
            </div>
          )}

          {/* Download icon + tags — visible on hover */}
          <motion.div
            className="sq-card-hover-content"
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: SQ_DURATION, ease: SQ_EASE }}
          >
            <div className="sq-card-dl-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="sq-card-tags">
              {shownTags.map((tag, i) => (
                <span key={i}>
                  {i > 0 && <span className="sq-dot">•</span>}
                  {tag}
                </span>
              ))}
              {remainingCount > 0 && (
                <span><span className="sq-dot">•</span>+{remainingCount}</span>
              )}
            </div>
          </motion.div>

          {/* Touch-device preview button (no hover) */}
          {isTouchDevice && app.trailerVideoUrl && (
            <button
              className="sq-card-preview-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play().catch(() => { });
                  } else {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                  }
                }
              }}
            >
              ▶ Preview
            </button>
          )}
        </div>

        {/* ─── Info Area ─── */}
        <div className="sq-card-info">
          <div className="sq-card-title">{app.name}</div>
          <div className="sq-card-meta">
            <span className="sq-card-price">FREE</span>
            <span className="sq-card-reviews">
              {app.downloads ? `${Math.floor(app.downloads / 1000)}k` : '0'} Reviews
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}