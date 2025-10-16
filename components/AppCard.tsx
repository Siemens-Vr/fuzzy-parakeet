'use client';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
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
        <motion.div 
          className="card-content"
          style={{ transform: "translateZ(30px)" }}
          animate={{
            y: isHovered ? -8 : 0
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
        >
          <motion.div 
            className="card-title"
            whileHover={{ x: 5 }}
          >
            {app.name}
          </motion.div>
          <motion.div 
            className="card-meta-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span 
              style={{ 
                textTransform: 'uppercase', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              whileHover={{ scale: 1.1 }}
            >
              FREE
            </motion.span>
            <span>
              {app.downloads ? `${Math.floor(app.downloads / 1000)}k` : '0'} Reviews
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  );
}