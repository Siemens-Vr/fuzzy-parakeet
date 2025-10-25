'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
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

export default function AppDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();

  // ---- States ----
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ---- Sideload State ----
  const [busy, setBusy] = useState(false);
  const [connectedSerial, setConnectedSerial] = useState<string | null>(null);
  const [sideloadLog, setSideloadLog] = useState<string>('');
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const adbRef = useRef<any>(null);
  const libsRef = useRef<AdbLibs | null>(null);

  // ---- Fetch app data ----
  useEffect(() => {
    fetchApp();
    checkAuthStatus();
  }, [params.slug]);

  const fetchApp = async () => {
    try {
      const response = await fetch(`/api/public/apps/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setApp(data);
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Error fetching app:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/user/me', { credentials: 'include' });
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };

  // ---- Download Handler ----
  const handleDownload = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    window.location.href = `/api/download/${params.slug}`;
  };

  // ---- Helpers ----
  const appendLog = (line: string) =>
    setSideloadLog((prev) => (prev ? prev + '\n' : '') + line);

  const webUsbSupported = useMemo(() => typeof navigator !== 'undefined' && !!(navigator as any).usb, []);
  const isChromeOrEdge = useMemo(
    () => typeof navigator !== 'undefined' && /chrome|chromium|edg/i.test(navigator.userAgent),
    []
  );
  const isQuestBrowser = useMemo(
    () => typeof navigator !== 'undefined' && /OculusBrowser/i.test(navigator.userAgent),
    []
  );

  // ---------- Lazy-load ADB libs ----------
  const loadLibs = useCallback(async (): Promise<AdbLibs> => {
    if (libsRef.current) return libsRef.current;
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
  }, []);

  // ---------- Connect Quest ----------
  const connectQuest = useCallback(async () => {
    if (!webUsbSupported) throw new Error('WebUSB not supported.');
    if (!isChromeOrEdge) throw new Error('Use Chrome or Edge.');
    if (isQuestBrowser) throw new Error('Not supported in Quest browser.');
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost')
      throw new Error('Requires HTTPS or localhost.');

    const { Adb, AdbDaemonTransport, AdbWebCredentialStore, AdbDaemonWebUsbDeviceManager } = await loadLibs();
    const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
    if (!Manager) throw new Error('WebUSB ADB not available.');

    appendLog('🔌 Requesting Quest device…');
    const device = await Manager.requestDevice();
    const connection = await device.connect();

    appendLog('🔐 Authenticating ADB session…');
    const credentialStore = new AdbWebCredentialStore('QuestSideload');
    const transport = await AdbDaemonTransport.authenticate({
      serial: device.serial,
      connection,
      credentialStore,
    });

    const adb = new Adb(transport);
    adbRef.current = adb;
    setConnectedSerial(device.serial ?? 'Quest');
    setDeviceConnected(true);
    appendLog(`✅ Connected: ${device.serial ?? '(no serial)'}`);
    return adb;
  }, [loadLibs, webUsbSupported, isChromeOrEdge, isQuestBrowser]);

  // ---------- Fetch & Install ----------
  const fetchApkFile = useCallback(async (): Promise<Response> => {
    appendLog('📥 Fetching APK for sideloading…');
    const res = await fetch(`/api/download/${params.slug}`, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
    return res;
  }, [params.slug]);

  const pushAndInstallApk = useCallback(async (adb: any, response: Response) => {
    const { PackageManager } = await loadLibs();
    const pm = new PackageManager(adb);
    const total = Number(response.headers.get('content-length')) || 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream');

    appendLog('⬆️ Uploading & installing…');
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) return controller.close();
        if (value) controller.enqueue(value);
      },
    });

    await pm.installStream(total, stream, { grantRuntimePermissions: true });
    appendLog('✅ Installation complete.');
  }, [loadLibs]);

  const handleSideload = useCallback(async () => {
    if (isQuestBrowser) {
      alert('Not supported in Quest browser.');
      return;
    }
    if (!isChromeOrEdge) {
      alert('Use Chrome or Edge for sideloading.');
      return;
    }
    setBusy(true);
    setSideloadLog('');

    try {
      const adb = await connectQuest();
      const apkRes = await fetchApkFile();
      await pushAndInstallApk(adb, apkRes);
      appendLog('🎉 Done!');
    } catch (e: any) {
      appendLog(`❌ ${e.message}`);
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }, [connectQuest, fetchApkFile, pushAndInstallApk, isChromeOrEdge, isQuestBrowser]);

  // ---------- UI ----------
  if (loading)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#0066cc',
            borderRadius: '50%',
          }}
        />
      </div>
    );

  if (!app) return notFound();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* --- LOGIN MODAL --- */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginPrompt(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                padding: '40px',
                borderRadius: '20px',
                maxWidth: '440px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '4rem' }}>🔐</div>
              <h2 style={{ fontWeight: 800, marginBottom: 10 }}>Sign In Required</h2>
              <p style={{ color: '#64748b', marginBottom: 20 }}>
                You need to sign in to download apps from our store.
              </p>
              <Link href={`/auth/user/login?redirect=/apps/${params.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'linear-gradient(135deg,#0066cc,#00b894)',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACK BUTTON --- */}
      <Link href="/" className="back-link">
        ← Back to apps
      </Link>

      {/* --- MAIN CONTENT --- */}
      <div className="detail-layout">
        <div className="detail-main">
          <h1>{app.name}</h1>
          <p>{app.description}</p>
        </div>

        {/* --- SIDEBAR --- */}
        <motion.div className="detail-sidebar">
          {!isLoggedIn ? (
            <div style={{ background: '#fff3cd', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: '2rem' }}>🔐</div>
              <p style={{ fontWeight: 600, color: '#856404' }}>Sign in to download</p>
              <Link href={`/auth/user/login?redirect=/apps/${params.slug}`}>
                <button
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg,#0066cc,#00b894)',
                    color: '#fff',
                    borderRadius: 10,
                    border: 'none',
                    padding: '10px',
                    fontWeight: 700,
                  }}
                >
                  Sign In Now
                </button>
              </Link>
            </div>
          ) : (
            <>
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-download-large"
              >
                ⬇️ Download APK
              </motion.button>

              <motion.button
                onClick={handleSideload}
                disabled={busy || !isChromeOrEdge}
                style={{
                  background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                  marginTop: 10,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                🎯 {busy ? 'Sideloading...' : 'Sideload to Quest (USB)'}
              </motion.button>
            </>
          )}

          <div style={{ marginTop: 16, fontSize: 12 }}>
            <strong>Developer:</strong> {app.developer || 'Unknown'}
            <br />
            <strong>Version:</strong> {app.version}
            <br />
            <strong>File Size:</strong> {formatBytes(app.sizeBytes || 0)}
          </div>

          {sideloadLog && (
            <pre
              style={{
                background: '#0b1020',
                color: '#d1d5db',
                padding: 10,
                borderRadius: 8,
                marginTop: 16,
                fontSize: 12,
                whiteSpace: 'pre-wrap',
              }}
            >
              {sideloadLog}
            </pre>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
