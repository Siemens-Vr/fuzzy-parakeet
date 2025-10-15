'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import apps from '@/data/apps.json';
import { notFound } from 'next/navigation';
import { formatBytes } from '@/components/bytes';
import Link from 'next/link';

export default function AppDetail({ params }: { params: { slug: string } }) {
  const app = (apps as any[]).find((a) => a.slug === params.slug);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  if (!app) return notFound();

  const allImages = [
    app.icon,
    ...(app.screenshots || [])
  ].filter(Boolean);

  const handleDownload = () => {
    window.location.href = `/api/download/${app.slug}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <Link href="/" className="back-link">
        ← Back to apps
      </Link>

      {/* Detail Layout */}
      <div className="detail-layout">
        {/* Main Content */}
        <div className="detail-main">
          {/* Hero Image/Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="detail-hero"
          >
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[currentScreenshot]}
                  alt={`${app.name} screenshot ${currentScreenshot + 1}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)" /%3E%3C/svg%3E';
                  }}
                />
                {allImages.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentScreenshot(index)}
                        style={{
                          width: currentScreenshot === index ? '32px' : '12px',
                          height: '12px',
                          borderRadius: '6px',
                          background: currentScreenshot === index 
                            ? 'var(--primary)' 
                            : 'rgba(255, 255, 255, 0.5)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }} />
            )}
          </motion.div>

          {/* App Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="detail-header"
          >
            <h1 className="detail-title">{app.name}</h1>
            <div className="detail-rating-row">
              <div className="detail-rating">
                <span>⭐</span>
                <span>Rating: {app.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              {app.category && (
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  {app.category}
                </span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="detail-section"
          >
            <p className="detail-description">
              {app.description || app.summary}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="detail-section"
          >
            <h2>Features</h2>
            <ul className="detail-features">
              <li>
                <strong>📁 File Organizer</strong>
                <br />
                Browse, copy, move, rename, delete, compress, and extract files and folders
              </li>
              <li>
                <strong>💾 Storage File Manager</strong>
                <br />
                Full support for FAT32 and NTFS file systems (SD cards, USB OTG, Pen Drives, etc.)
              </li>
              <li>
                <strong>📡 Offline WiFi Share</strong>
                <br />
                Wirelessly transfer files between Quest and android phone without creating a hotspot
              </li>
              <li>
                <strong>🔗 Device Connect</strong>
                <br />
                Connect and manage your device files remotely
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="detail-sidebar"
        >
          <div className="sidebar-card">
            {/* Sidebar Image */}
            <img
              src={app.icon || app.screenshots?.[0]}
              alt={app.name}
              className="sidebar-card-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23667eea;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23764ba2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)" /%3E%3C/svg%3E';
              }}
            />

            {/* Sidebar Content */}
            <div className="sidebar-card-content">
              <div className="sidebar-card-title">{app.name}</div>
              
              <div className="sidebar-rating">
                <span>{app.rating?.toFixed(1) || 'N/A'}</span>
                <span>⭐</span>
              </div>

              {/* Download Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="btn-download-large"
              >
                Sideload Now
              </motion.button>

              {/* App Info */}
              <div className="sidebar-info-item">
                <div className="sidebar-info-label">Status</div>
                <div className="sidebar-info-value">FREE</div>
              </div>

              <div className="sidebar-info-item">
                <div className="sidebar-info-label">Compatible with</div>
                <div className="sidebar-info-value">
                  Quest, Go, Other, Magic_leap, Pico
                </div>
              </div>

              {app.lastUpdated && (
                <div className="sidebar-info-item">
                  <div className="sidebar-info-label">Last Updated</div>
                  <div className="sidebar-info-value">
                    {new Date(app.lastUpdated).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              )}

              <div className="sidebar-info-item">
                <div className="sidebar-info-label">Version</div>
                <div className="sidebar-info-value">{app.version}</div>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">😊</div>
                  <div className="stat-label">Comfort level</div>
                  <div className="stat-value">Comfortable</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">⬇️</div>
                  <div className="stat-label">Download clicks</div>
                  <div className="stat-value">
                    {app.downloads?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">📦</div>
                  <div className="stat-label">File Size</div>
                  <div className="stat-value">{formatBytes(app.sizeBytes)}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}