'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo, useCallback } from 'react';
import apps from '@/data/apps.json';
import { notFound } from 'next/navigation';
import { formatBytes } from '@/components/bytes';
import Link from 'next/link';

// ---- Types for lazy-loaded ADB libs ----
type AdbLibs = {
  Adb: any;
  AdbDaemonTransport: any;
  AdbDaemonWebUsbDeviceManager: any;
  AdbWebCredentialStore: any;
};

export default function AppDetail({ params }: { params: { slug: string } }) {
  const app = (apps as any[]).find((a) => a.slug === params.slug);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ---- Sideload state ----
  const [busy, setBusy] = useState(false);
  const [connectedSerial, setConnectedSerial] = useState<string | null>(null);
  const [sideloadLog, setSideloadLog] = useState<string>('');

  const adbRef = useRef<any>(null);
  const libsRef = useRef<AdbLibs | null>(null);

  if (!app) return notFound();

  const allImages = [app.icon, ...(app.screenshots || [])].filter(Boolean);

  const handleDownload = () => {
    window.location.href = `/api/download/${app.slug}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  // ---------- Sideload helpers ----------
  const appendLog = (line: string) =>
    setSideloadLog((p) => (p ? p + '\n' : '') + line);

  const webUsbSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return !!(navigator as any).usb;
  }, []);

  // Lazy-load ADB libs to avoid SSR issues
  const loadLibs = useCallback(async (): Promise<AdbLibs> => {
    if (libsRef.current) return libsRef.current;

    const [
      { Adb, AdbDaemonTransport },
      { default: AdbWebCredentialStore },
      { AdbDaemonWebUsbDeviceManager },
    ] = await Promise.all([
      import('@yume-chan/adb'),
      import('@yume-chan/adb-credential-web'),
      import('@yume-chan/adb-daemon-webusb'),
    ]);

    const bundle: AdbLibs = {
      Adb,
      AdbDaemonTransport,
      AdbWebCredentialStore,
      AdbDaemonWebUsbDeviceManager,
    };
    libsRef.current = bundle;
    return bundle;
  }, []);

  const connectQuest = useCallback(async () => {
    if (!webUsbSupported) {
      throw new Error('WebUSB not supported. Use Chrome/Edge over HTTPS (or http://localhost).');
    }

    const {
      Adb,
      AdbDaemonTransport,
      AdbWebCredentialStore,
      AdbDaemonWebUsbDeviceManager,
    } = await loadLibs();

    const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!Manager) throw new Error('No WebUSB ADB manager (unsupported browser).');

    appendLog('Requesting Quest device…');
    const device = await Manager.requestDevice(); // user gesture required
    if (!device) throw new Error('No device selected.');

    appendLog('Connecting ADB interface…');
    const connection = await device.connect();

    appendLog('Authenticating ADB session…');
    const credentialStore = new AdbWebCredentialStore('YourSite');
    const transport = await AdbDaemonTransport.authenticate({
      serial: device.serial,
      connection,
      credentialStore,
    });

    const adb = new Adb(transport);
    adbRef.current = adb;
    setConnectedSerial(device.serial ?? 'Quest');
    appendLog(`Connected: ${device.serial ?? '(no serial)'}`);

    try {
      await adb.subprocess.shellAndWait('echo ADB_OK');
      appendLog('ADB handshake complete.');
    } catch {
      appendLog('ADB shell check skipped.');
    }

    return adb as any;
  }, [loadLibs, webUsbSupported]);

  const pushAndInstallApk = useCallback(async (adb: any, file: File) => {
    const remote = '/data/local/tmp/app.apk';

    appendLog(`Pushing ${file.name} → ${remote} …`);
    const sync = await adb.sync();
    if (typeof sync.write === 'function') {
      await sync.write({ filename: remote, stream: file.stream() });
    } else if (typeof sync.push === 'function') {
      await sync.push(file.stream(), remote);
    } else {
      throw new Error('ADB sync API not supported by this build.');
    }
    if (typeof sync.dispose === 'function') await sync.dispose();

    appendLog('Installing (pm install -r)…');
    const result = await adb.subprocess.shellAndWait(`pm install -r "${remote}"`);
  
    try {
      const out = await result.stdout;
      if (out) appendLog(String(out));
    } catch { /* ignore */ }

  
    try { await adb.subprocess.shellAndWait(`rm -f "${remote}"`); } catch { /* ignore */ }

    appendLog('Done ✅  Check headset: Apps → Unknown Sources.');
  }, []);

  const fetchApkFile = useCallback(async (): Promise<File> => {
    appendLog('Fetching APK…');
    const res = await fetch(`/api/download/${app.slug}`, { method: 'GET' });
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    const blob = await res.blob();
 
    const type = res.headers.get('content-type') ?? 'application/vnd.android.package-archive';
    const filename =
      (app.apkFileName as string | undefined) ||
      `${app.slug}.apk`;
    return new File([blob], filename, { type });
  }, [app.slug, app.apkFileName]);

  const handleSideload = useCallback(async () => {
    setBusy(true);
    setSideloadLog(''); 
    try {
      const adb = await connectQuest();
      const file = await fetchApkFile();
      await pushAndInstallApk(adb, file);
    } catch (e: any) {
      appendLog(`❌ ${e?.message || String(e)}`);
      if (typeof window !== 'undefined') {
        alert(e?.message || 'Sideload failed. See log.');
      }
    } finally {
      setBusy(false);
    }
  }, [connectQuest, fetchApkFile, pushAndInstallApk]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Link href="/" className="back-link">
          <motion.span animate={{ x: [-2, 0, -2] }} transition={{ duration: 1.5, repeat: Infinity }}>
            ←
          </motion.span>
          Back to apps
        </Link>
      </motion.div>

      {/* Detail Layout */}
      <motion.div className="detail-layout" variants={containerVariants} initial="hidden" animate="visible">
        {/* Main Content */}
        <div className="detail-main">
          {/* Hero Image/Carousel */}
          <motion.div variants={itemVariants} className="detail-hero" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            {allImages.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentScreenshot}
                    src={allImages[currentScreenshot]}
                    alt={`${app.name} screenshot ${currentScreenshot + 1}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231e40af;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)" /%3E%3C/svg%3E';
                      setImageLoaded(true);
                    }}
                  />
                </AnimatePresence>
                {allImages.length > 1 && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      bottom: '1.5rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '0.75rem',
                      background: 'rgba(0, 0, 0, 0.5)',
                      padding: '0.75rem',
                      borderRadius: '30px',
                      backdropFilter: 'blur(10px)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {allImages.map((_, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setCurrentScreenshot(index);
                          setImageLoaded(false);
                        }}
                        style={{
                          width: currentScreenshot === index ? '40px' : '14px',
                          height: '14px',
                          borderRadius: '7px',
                          background:
                            currentScreenshot === index
                              ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                              : 'rgba(255, 255, 255, 0.4)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--accent-dark) 100%)',
                }}
              />
            )}
          </motion.div>

          {/* App Header */}
          <motion.div variants={itemVariants} className="detail-header">
            <motion.h1
              className="detail-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {app.name}
            </motion.h1>
            <div className="detail-rating-row">
              <motion.div className="detail-rating" whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
                <motion.span
                  animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ⭐
                </motion.span>
                <span>Rating: {app.rating?.toFixed(1) || 'N/A'}</span>
              </motion.div>
              {app.category && (
                <motion.span
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: 'var(--surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    border: '2px solid var(--border)',
                  }}
                  whileHover={{ scale: 1.05, borderColor: 'var(--primary)', color: 'var(--primary-light)' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {app.category}
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="detail-section">
            <motion.p className="detail-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {app.description || app.summary}
            </motion.p>
          </motion.div>

          {/* Features */}
          <motion.div variants={itemVariants} className="detail-section">
            <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              Features
            </motion.h2>
            <ul className="detail-features">
              {[
                { icon: '📁', title: 'File Organizer', desc: 'Browse, copy, move, rename, delete, compress, and extract files and folders' },
                { icon: '💾', title: 'Storage File Manager', desc: 'Full support for FAT32 and NTFS file systems (SD cards, USB OTG, Pen Drives, etc.)' },
                { icon: '📡', title: 'Offline WiFi Share', desc: 'Wirelessly transfer files between Quest and android phone without creating a hotspot' },
                { icon: '🔗', title: 'Device Connect', desc: 'Connect and manage your device files remotely' },
              ].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ x: 10, transition: { duration: 0.2 } }}
                >
                  <strong>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {feature.icon}
                    </motion.span>{' '}
                    {feature.title}
                  </strong>
                  <br />
                  {feature.desc}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="detail-sidebar"
        >
          <motion.div className="sidebar-card" whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
            {/* Sidebar Image */}
            <motion.img
              src={app.icon || app.screenshots?.[0]}
              alt={app.name}
              className="sidebar-card-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%231e40af;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="225" fill="url(%23grad)" /%3E%3C/svg%3E';
              }}
            />

            {/* Sidebar Content */}
            <div className="sidebar-card-content">
              <motion.div className="sidebar-card-title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                {app.name}
              </motion.div>

              <motion.div className="sidebar-rating" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
                <span>{app.rating?.toFixed(1) || 'N/A'}</span>
                <motion.span animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                  ⭐
                </motion.span>
              </motion.div>

              {/* Download Button */}
              <motion.button
                onClick={handleDownload}
                className="btn-download-large"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03, boxShadow: '0 16px 32px rgba(30, 64, 175, 0.6)' }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  ⬇️
                </motion.span>{' '}
                Download Now
              </motion.button>

              {/* Sideload Now Button */}
              <motion.button
                onClick={handleSideload}
                className="btn-download-large"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                whileHover={{ scale: busy ? 1 : 1.03, boxShadow: busy ? undefined : '0 16px 32px rgba(30, 64, 175, 0.6)' }}
                whileTap={{ scale: busy ? 1 : 0.97 }}
                disabled={busy}
                style={{ opacity: busy ? 0.7 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}
                title={connectedSerial ? `Connected: ${connectedSerial}` : 'Connect & install via USB'}
              >
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  🧩
                </motion.span>{' '}
                {busy ? 'Installing…' : 'Sideload Now'}
              </motion.button>

              {/* App Info */}
              <motion.div className="sidebar-info-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} whileHover={{ x: 5 }}>
                <div className="sidebar-info-label">Status</div>
                <motion.div
                  className="sidebar-info-value"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  FREE
                </motion.div>
              </motion.div>

              <motion.div className="sidebar-info-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} whileHover={{ x: 5 }}>
                <div className="sidebar-info-label">Compatible with</div>
                <div className="sidebar-info-value">Quest, Go, Other, Magic_leap, Pico</div>
              </motion.div>

              {app.lastUpdated && (
                <motion.div className="sidebar-info-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} whileHover={{ x: 5 }}>
                  <div className="sidebar-info-label">Last Updated</div>
                  <div className="sidebar-info-value">
                    {new Date(app.lastUpdated).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </motion.div>
              )}

              <motion.div className="sidebar-info-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }} whileHover={{ x: 5 }}>
                <div className="sidebar-info-label">Version</div>
                <div className="sidebar-info-value">{app.version}</div>
              </motion.div>

              {/* Stats */}
              <motion.div className="stats-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                {[
                  { icon: '😊', label: 'Comfort level', value: 'Comfortable' },
                  { icon: '⬇️', label: 'Download clicks', value: app.downloads?.toLocaleString() || '0' },
                  { icon: '📦', label: 'File Size', value: formatBytes(app.sizeBytes) },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="stat-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  >
                    <motion.div className="stat-icon" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}>
                      {stat.icon}
                    </motion.div>
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Simple sideload log output (optional) */}
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: '#0b1020',
                  color: '#d1d5db',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 12,
                  whiteSpace: 'pre-wrap',
                }}
              >
                <div style={{ color: '#93c5fd', marginBottom: 6 }}>
                  Sideload Status: {busy ? 'Working…' : connectedSerial ? `Connected (${connectedSerial})` : 'Idle'}
                </div>
                {sideloadLog || 'Logs will appear here…'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
