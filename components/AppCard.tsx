'use client';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';

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

export default function AppCard({ app }: { app: AppMeta }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["7.5deg", "-7.5deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-7.5deg", "7.5deg"]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    // Stop trailer video
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setVideoPlaying(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Start trailer video after a short delay
    if (app.trailerVideoUrl && videoRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setVideoPlaying(true);
          }).catch(() => {
            // Autoplay blocked or video error — fail silently
          });
        }
      }, 400);
    }
  };

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
        className="card"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 100
        }}
      >
        {/* Card Image */}
        <div className="card-image-wrapper">
          {!imageLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--accent-dark) 100%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          )}
          <motion.img
            src={app.icon || app.screenshots?.[0] || '/placeholder.jpg'}
            alt={app.name}
            className="card-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231e40af;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)" /%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="white" text-anchor="middle" dy=".3em"%3E%3C/text%3E%3C/svg%3E';
              setImageLoaded(true);
            }}
          />

          {/* Trailer Video Overlay */}
          {app.trailerVideoUrl && (
            <>
              <video
                ref={videoRef}
                className={`card-trailer-video ${videoPlaying ? 'playing' : ''}`}
                src={app.trailerVideoUrl}
                muted
                loop
                playsInline
                preload="none"
              />
              {/* <div className={`card-trailer-indicator ${videoPlaying ? 'hidden' : ''}`}>
                ▶
              </div> */}
            </>
          )}

          {/* Rating Badge */}
          {app.rating && (
            <motion.div
              className="card-rating"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5
              }}
            >
              <motion.span
                animate={{
                  rotate: [0, 20, -20, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                ⭐
              </motion.span>
              <span>{app.rating.toFixed(1)}</span>
            </motion.div>
          )}

          {/* Hover Actions */}
          <motion.div
            className="card-actions"
            initial={{ opacity: 0, y: 20 }}
          >
            <motion.button
              onClick={handleDownload}
              className="card-action-btn download"
              aria-label="Download"
              whileHover={{
                scale: 1.2,
                rotate: 360,
                transition: { duration: 0.4 }
              }}
              whileTap={{ scale: 0.8 }}
            >
              ⬇️
            </motion.button>
            <motion.button
              onClick={handleFavorite}
              className="card-action-btn favorite"
              aria-label="Favorite"
              whileHover={{
                scale: 1.2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.8 }}
              animate={isFavorite ? {
                scale: [1, 1.3, 1],
                rotate: [0, -10, 10, 0]
              } : {}}
              transition={{
                duration: 0.5
              }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </motion.button>
          </motion.div>
        </div>

        {/* Animated Separator Line */}
        <motion.div
          className="card-separator"
          animate={{
            scaleY: isHovered ? 0.4 : 1,
            y: isHovered ? -8 : 0
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        />

        {/* Card Content */}
        <div className="card-content-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Normal content - visible by default, hidden on hover */}
          <motion.div
            className="card-content"
            style={{ transform: "translateZ(30px)" }}
            animate={{
              opacity: isHovered ? 0 : 1,
              y: isHovered ? -12 : 0,
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut"
            }}
          >
            <div className="card-title">
              {app.name}
            </div>
            <div className="card-meta-row">
              <span
                style={{
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                FREE
              </span>
              <span>
                {app.downloads ? `${Math.floor(app.downloads / 1000)}k` : '0'} Reviews
              </span>
            </div>
          </motion.div>

          {/* Hover state - download icon + category tags */}
          <motion.div
            className="card-hover-action"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 12,
            }}
            transition={{
              duration: 0.25,
              ease: "easeInOut"
            }}
          >
            {/* Circular download icon */}
            <motion.div
              className="card-dl-icon"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </motion.div>

            {/* Category tags */}
            <div className="card-hover-tags">
              {(() => {
                const allTags = app.tags && app.tags.length > 0
                  ? app.tags
                  : app.category
                    ? [app.category.charAt(0) + app.category.slice(1).toLowerCase().replace(/_/g, ' ')]
                    : [];
                const shown = allTags.slice(0, 2);
                const remaining = allTags.length - 2;
                return (
                  <>
                    {shown.map((tag, i) => (
                      <span key={i}>
                        {i > 0 && <span className="card-hover-dot">•</span>}
                        {tag}
                      </span>
                    ))}
                    {remaining > 0 && (
                      <span>
                        <span className="card-hover-dot">•</span>
                        +{remaining}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}