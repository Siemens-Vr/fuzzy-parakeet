'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
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
  PackageManager: any;
};

type AppRecord = {
  slug: string;
  name: string;
  icon?: string;
  screenshots?: string[];
  rating?: number;
  category?: string;
  description?: string;
  summary?: string;
  version?: string;
  downloads?: number;
  sizeBytes?: number;
  lastUpdated?: string;

  // OPTIONAL: Add one or more of these to enable in-headset install
  oculusAppId?: string;  // e.g. "5593721234567890"
  appLabUrl?: string;    // e.g. "https://www.meta.com/experiences/5593721234567890"
  storeUrl?: string;     // any Meta Store URL for this app

  // for sideloading:
  apkFileName?: string;
};

export default function AppDetail({ params }: { params: { slug: string } }) {
  const app = (apps as AppRecord[]).find((a) => a.slug === params.slug);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ---- Sideload state ----
  const [busy, setBusy] = useState(false);
  const [connectedSerial, setConnectedSerial] = useState<string | null>(null);
  const [sideloadLog, setSideloadLog] = useState<string>('');
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const adbRef = useRef<any>(null);
  const libsRef = useRef<AdbLibs | null>(null);

  if (!app) return notFound();

  const allImages = [app.icon, ...(app.screenshots || [])].filter(Boolean) as string[];

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

  // ---------- Helpers ----------
  const appendLog = (line: string) =>
    setSideloadLog((p) => (p ? p + '\n' : '') + line);

  const webUsbSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return !!(navigator as any).usb;
  }, []);

  const isChromeOrEdge = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /chrome|chromium|edg/i.test(ua);
  }, []);

  // Detect Oculus/Quest Browser (in-headset)
  const isQuestBrowser = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /OculusBrowser/i.test(navigator.userAgent);
  }, []);

  // Build candidate deep links / URLs for Store/App Lab
  const storeTargets = useMemo(() => {
    const urls: string[] = [];
    if (app.oculusAppId) {
      // In-headset, the oculus:// scheme should open the Store app directly.
      urls.push(`oculus://app/${app.oculusAppId}`);
      // Some headsets/OS builds may prefer a different path; keep an extra attempt:
      urls.push(`oculus://store/app/${app.oculusAppId}`);
      // Web fallback that works on desktop/phone too:
      urls.push(`https://www.meta.com/experiences/${app.oculusAppId}`);
    }
    if (app.appLabUrl) urls.push(app.appLabUrl);
    if (app.storeUrl) urls.push(app.storeUrl);
    // De-dup while preserving order
    return Array.from(new Set(urls));
  }, [app.oculusAppId, app.appLabUrl, app.storeUrl]);

  const canOpenStore = storeTargets.length > 0;

  const handleOpenInStore = useCallback(() => {
    if (!canOpenStore) {
      alert('No App Lab/Store link configured for this app.\nAdd "oculusAppId", "appLabUrl", or "storeUrl" in apps.json.');
      return;
    }
    // Try deep link first (in-headset), then fall back to web URL.
    const [primary, ...fallbacks] = storeTargets;
    // Navigate to primary
    window.location.href = primary;
    // Also open a fallback in a new tab after a short delay (helps on desktop)
    setTimeout(() => {
      if (fallbacks[0]) window.open(fallbacks[0], '_blank');
    }, 1200);
  }, [canOpenStore, storeTargets]);

  // ---------- Lazy-load ADB libs ----------
  const loadLibs = useCallback(async (): Promise<AdbLibs> => {
    if (libsRef.current) return libsRef.current;

    try {
      const [
        { Adb, AdbDaemonTransport },
        { default: AdbWebCredentialStore },
        { AdbDaemonWebUsbDeviceManager },
        { PackageManager },
      ] = await Promise.all([
        import('@yume-chan/adb'),
        import('@yume-chan/adb-credential-web'),
        import('@yume-chan/adb-daemon-webusb'),
        import('@yume-chan/android-bin'),
      ]);

      const bundle: AdbLibs = {
        Adb,
        AdbDaemonTransport,
        AdbWebCredentialStore,
        AdbDaemonWebUsbDeviceManager,
        PackageManager,
      };
      libsRef.current = bundle;
      return bundle;
    } catch (error) {
      appendLog('❌ Failed to load ADB libraries. Make sure you are using Chrome/Edge.');
      throw error;
    }
  }, []);

  // Check for existing devices on mount (desktop USB sideload only)
  useEffect(() => {
    const checkExistingDevices = async () => {
      if (!webUsbSupported || !isChromeOrEdge) return;

      try {
        const { AdbDaemonWebUsbDeviceManager } = await loadLibs();
        const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
        if (!Manager) return;

        const devices = await Manager.getDevices();
        if (devices.length > 0) {
          setDeviceConnected(true);
          appendLog('Found connected Quest device. Ready to sideload.');
        }
      } catch {
        /* ignore */
      }
    };

    checkExistingDevices();
  }, [webUsbSupported, isChromeOrEdge, loadLibs]);

  const connectQuest = useCallback(async () => {
    if (!webUsbSupported) {
      throw new Error('WebUSB not supported. Use Chrome or Edge browser.');
    }
    if (!isChromeOrEdge) {
      throw new Error('Sideloading only works with Chrome or Edge browsers.');
    }
    if (isQuestBrowser) {
      throw new Error('USB sideloading is not available inside the Quest browser.');
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new Error('Sideloading requires HTTPS (or http://localhost).');
    }

    const {
      Adb,
      AdbDaemonTransport,
      AdbWebCredentialStore,
      AdbDaemonWebUsbDeviceManager,
    } = await loadLibs();

    const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!Manager) throw new Error('WebUSB ADB not available. Use Chrome/Edge on desktop.');

    appendLog('🔌 Requesting Quest device…');
    appendLog('Make sure your Quest is:\n• Connected via USB cable\n• USB debugging is enabled\n• Allow USB debugging dialog is accepted');

    let device: any;
    try {
      device = await Manager.requestDevice();
    } catch {
      throw new Error('Failed to request device. Make sure your Quest is connected and USB debugging is enabled.');
    }

    if (!device) throw new Error('No device selected.');

    appendLog('📡 Connecting ADB interface…');
    let connection: any;
    try {
      connection = await device.connect();
    } catch {
      throw new Error('Failed to connect to device. Try reconnecting the USB cable.');
    }

    appendLog('🔐 Authenticating ADB session…');
    let transport: any;
    try {
      const credentialStore = new AdbWebCredentialStore('QuestSideload');
      transport = await AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore,
      });
    } catch {
      throw new Error('ADB authentication failed. Check if USB debugging is enabled on your Quest.');
    }

    const adb = new libsRef.current!.Adb(transport);
    adbRef.current = adb;
    setConnectedSerial(device.serial ?? 'Quest');
    setDeviceConnected(true);
    appendLog(`✅ Connected: ${device.serial ?? '(no serial)'}`);

    try {
      if (adb.subprocess.shellProtocol) {
        const { exitCode, stdout } = await adb.subprocess.shellProtocol.spawnWaitText(['sh', '-c', 'echo ADB_OK']);
        if (exitCode === 0 && String(stdout).includes('ADB_OK')) appendLog('ADB handshake complete.');
      } else {
        const out = await adb.subprocess.noneProtocol.spawnWaitText('echo ADB_OK');
        if (String(out).includes('ADB_OK')) appendLog('ADB handshake complete (none protocol).');
      }
    } catch {
      appendLog('ADB shell check skipped.');
    }

    return adb;
  }, [loadLibs, webUsbSupported, isChromeOrEdge, isQuestBrowser]);

  // Push & install with modern API (PackageManager.installStream)
  const pushAndInstallApk = useCallback(async (adb: any, response: Response) => {
    const totalSize = Number(response.headers.get('content-length')) || 0;
    const filename = (app.apkFileName as string | undefined) || `${app.slug}.apk`;

    if (!response.body) {
      throw new Error('Response body is not available for streaming.');
    }

    appendLog(`📦 Installing ${filename} to Quest …`);
    if (totalSize > 0) appendLog(`📊 File size: ${formatBytes(totalSize)}`);
    appendLog('⬆️ Uploading & installing (streaming)…');

    try {
      const { PackageManager } = await loadLibs();
      const pm = new PackageManager(adb);

      const reader = response.body.getReader();
      let bytesWritten = 0;
      let lastPercentage = -1;

      const progressStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
          const { done, value } = await reader.read();
          if (done) return controller.close();
          if (value) {
            controller.enqueue(value);
            bytesWritten += value.length;

            if (totalSize > 0) {
              const percentage = Math.floor((bytesWritten / totalSize) * 100);
              setUploadProgress(percentage);
              if (percentage !== lastPercentage && (percentage % 10 === 0 || percentage === 100)) {
                appendLog(`📈 Upload progress: ${percentage}% (${formatBytes(bytesWritten)}/${formatBytes(totalSize)})`);
                lastPercentage = percentage;
              }
            }
          }
        },
        cancel(reason) {
          reader.cancel(reason);
        },
      });

      await pm.installStream(totalSize, progressStream, { grantRuntimePermissions: true });

      appendLog('✅ Installation successful!');
      appendLog('🎉 App installed on your Quest!');
      appendLog('📱 Check your headset: Library → Unknown Sources');
      setUploadProgress(0);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      appendLog(`❌ Error: ${errorMsg}`);
      setUploadProgress(0);

      if (/INSTALL_FAILED_ALREADY_EXISTS/i.test(errorMsg)) {
        appendLog('⚠️ App already exists. You may need to uninstall the existing version and try again.');
      } else if (/INSUFFICIENT_STORAGE|NO_SPACE/i.test(errorMsg)) {
        appendLog('❌ Not enough storage space on Quest. Free up space and try again.');
      } else if (/INVALID_APK|PARSE_ERROR|bad zip/i.test(errorMsg)) {
        appendLog('❌ APK appears invalid or corrupted.');
      } else if (/disconnected|ECONNRESET|broken pipe/i.test(errorMsg)) {
        appendLog('🔌 USB connection lost. Please reconnect and try again.');
      }

      throw error;
    }
  }, [app.slug, app.apkFileName, loadLibs]);

  const fetchApkFile = useCallback(async (): Promise<Response> => {
    appendLog('📥 Fetching APK for sideloading…');
    try {
      const res = await fetch(`/api/download/${app.slug}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
      if (!res.body) throw new Error('APK stream not available from server');

      appendLog('✅ APK fetched successfully');
      return res;
    } catch (error) {
      appendLog('❌ Failed to fetch APK file');
      throw error;
    }
  }, [app.slug]);

  // Main sideload function (desktop Chrome/Edge only)
  const handleSideload = useCallback(async () => {
    if (isQuestBrowser) {
      alert('USB sideloading is not available inside the Quest browser.\nUse a desktop browser with a USB cable, or use the App Lab/Store button to install in-headset.');
      return;
    }

    if (!webUsbSupported) {
      alert('WebUSB not supported. Please use Chrome or Edge browser.');
      return;
    }
    if (!isChromeOrEdge) {
      alert('Sideloading only works with Chrome or Edge browsers.');
      return;
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      alert('Sideloading requires HTTPS (or http://localhost for development).');
      return;
    }

    setBusy(true);
    setSideloadLog('');
    setUploadProgress(0);

    try {
      appendLog('🚀 Starting Quest sideload process...');
      appendLog('Please ensure your Quest is:');
      appendLog('• Connected via USB cable');
      appendLog('• USB debugging is enabled');
      appendLog('• "Allow USB Debugging" prompt is accepted');
      appendLog('');

      let adb = adbRef.current;
      if (!adb || !deviceConnected) {
        appendLog('1. Connecting to Quest...');
        adb = await connectQuest();
      } else {
        appendLog('1. Using existing Quest connection...');
      }

      appendLog('2. Downloading APK...');
      const response = await fetchApkFile();

      appendLog('3. Installing to Quest...');
      await pushAndInstallApk(adb, response);

      appendLog('🎊 Sideloading completed successfully!');
      appendLog('You can now put on your headset and enjoy the app!');
    } catch (e: any) {
      const errorMessage = e?.message || String(e);
      appendLog(`💥 Sideload failed: ${errorMessage}`);
      if (typeof window !== 'undefined') {
        alert(`Sideload failed: ${errorMessage}\n\nCheck the log for details and solutions.`);
      }
    } finally {
      setBusy(false);
    }
  }, [connectQuest, fetchApkFile, pushAndInstallApk, webUsbSupported, isChromeOrEdge, deviceConnected, isQuestBrowser]);

  // Browser compatibility warnings
  useEffect(() => {
    if (!isChromeOrEdge && typeof window !== 'undefined') {
      appendLog('⚠️ Warning: For USB sideloading, please use Chrome or Edge on desktop.');
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      appendLog('⚠️ Warning: Sideloading requires HTTPS (or http://localhost).');
    }
    if (isQuestBrowser) {
      appendLog('ℹ️ Tip: Inside the Quest browser, use the "Install in Quest (App Lab/Store)" button below.');
    }
  }, [isChromeOrEdge, isQuestBrowser]);

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

          {/* Features (example content) */}
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

          {/* Sideload Instructions */}
          <motion.div variants={itemVariants} className="detail-section">
            <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              Quest Sideload Instructions
            </motion.h2>
            <div style={{
              background: 'var(--surface-hover)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '2px solid var(--border)'
            }}>
              <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                <li>Enable <strong>Developer Mode</strong> on your Quest (in Meta Quest mobile app)</li>
                <li>Enable <strong>USB Debugging</strong> in Settings → Developer</li>
                <li>Use a desktop Chrome/Edge browser and connect your Quest via USB cable</li>
                <li>Click <strong>"Sideload to Quest"</strong></li>
                <li>Select your Quest when prompted and accept <strong>"Allow USB Debugging"</strong> in-headset</li>
                <li>Wait for installation to complete, then check <strong>Library → Unknown Sources</strong></li>
              </ol>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                <strong>Note:</strong> Inside the Quest browser, use the <em>Install in Quest (App Lab/Store)</em> button instead.
              </div>
            </div>
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
              src={app.icon || app.screenshots?.[0] || ''}
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

              {/* NEW: Install in Quest (App Lab / Store) */}
              {canOpenStore && (
                <motion.button
                  onClick={handleOpenInStore}
                  className="btn-download-large"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 16px 32px rgba(16, 185, 129, 0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginBottom: '0.75rem',
                    background: 'linear-gradient(135deg, #10b981, #22c55e)'
                  }}
                  title={isQuestBrowser ? 'Opens the Meta Store in-headset' : 'Opens App Lab/Store page'}
                >
                  🟢 Install in Quest (App Lab/Store)
                </motion.button>
              )}

              {/* Optional: show the first store URL for copying */}
              {canOpenStore && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                  <span style={{ opacity: 0.75 }}>Store link:</span> {storeTargets[storeTargets.length - 1]}
                </div>
              )}

              {/* Download APK to computer */}
              <motion.button
                onClick={handleDownload}
                className="btn-download-large"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03, boxShadow: '0 16px 32px rgba(30, 64, 175, 0.6)' }}
                whileTap={{ scale: 0.97 }}
                style={{ marginBottom: '0.75rem' }}
              >
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  ⬇️
                </motion.span>{' '}
                Download to Computer
              </motion.button>

              {/* USB Sideload (desktop only) */}
              <motion.button
                onClick={handleSideload}
                className="btn-download-large"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                whileHover={{
                  scale: busy || isQuestBrowser ? 1 : 1.03,
                  boxShadow: busy || isQuestBrowser ? undefined : '0 16px 32px rgba(139, 92, 246, 0.6)'
                }}
                whileTap={{ scale: busy || isQuestBrowser ? 1 : 0.97 }}
                disabled={busy || !isChromeOrEdge || isQuestBrowser}
                style={{
                  opacity: (busy || !isChromeOrEdge || isQuestBrowser) ? 0.7 : 1,
                  cursor: (busy || !isChromeOrEdge || isQuestBrowser) ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  marginBottom: '1rem'
                }}
                title={
                  isQuestBrowser
                    ? 'USB sideloading is not available inside the Quest browser'
                    : (!isChromeOrEdge ? 'Requires Chrome or Edge browser' : (deviceConnected ? `Connected: ${connectedSerial}` : 'Connect Quest via USB to sideload'))
                }
              >
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  🎯
                </motion.span>{' '}
                {busy ? 'Sideloading to Quest…' : 'Sideload to Quest (USB)'}
              </motion.button>

              {/* Browser Compatibility / Context Tips */}
              {!isChromeOrEdge && !isQuestBrowser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(248, 113, 113, 0.1)',
                    border: '1px solid rgb(248, 113, 113)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  ⚠️ USB sideloading requires Chrome or Edge on desktop
                </motion.div>
              )}

              {isQuestBrowser && !canOpenStore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.6)',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                  }}
                >
                  ℹ️ To install in-headset, publish to App Lab or a Release Channel and add its URL or App ID to <code>apps.json</code> (fields: <code>oculusAppId</code>, <code>appLabUrl</code>, or <code>storeUrl</code>).
                </motion.div>
              )}

              {/* Connection Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: deviceConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  border: `1px solid ${deviceConnected ? 'rgb(34, 197, 94)' : 'rgb(248, 113, 113)'}`,
                  marginBottom: '1rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: deviceConnected ? 'rgb(34, 197, 94)' : 'rgb(248, 113, 113)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: deviceConnected ? 'rgb(34, 197, 94)' : 'rgb(248, 113, 113)',
                    animation: deviceConnected ? 'pulse 2s infinite' : 'none'
                  }} />
                  {deviceConnected ? 'Quest Connected' : 'Quest Not Connected'}
                </div>
              </motion.div>

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
                <div className="sidebar-info-value">Quest 2/3/Pro, Android</div>
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
                  { icon: '📦', label: 'File Size', value: formatBytes(app.sizeBytes || 0) },
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

              {/* Progress Bar */}
              {busy && (
                <div style={{ marginTop: 8, width: '100%' }}>
                  <div style={{ height: 8, background: '#1f2937', borderRadius: 999 }}>
                    <div
                      style={{
                        height: 8,
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg,#8b5cf6,#6366f1)',
                        borderRadius: 999,
                        transition: 'width .2s ease-out',
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
                    Upload: {uploadProgress}%
                  </div>
                </div>
              )}

              {/* Sideload Log */}
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
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #374151'
                }}
              >
                <div style={{
                  color: deviceConnected ? '#93c5fd' : '#fca5a5',
                  marginBottom: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    Sideload Status: {busy ? 'Working…' : deviceConnected ? `Connected (${connectedSerial || 'Quest'})` : 'Disconnected'}
                  </span>
                  {busy && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 12, height: 12, border: '2px solid #93c5fd', borderTop: '2px solid transparent', borderRadius: '50%' }}
                    />
                  )}
                </div>
                {sideloadLog || (isQuestBrowser
                  ? 'Inside the Quest browser: use "Install in Quest (App Lab/Store)". USB sideloading is desktop-only.'
                  : 'Connect your Quest and click "Sideload to Quest (USB)" to begin...')}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
