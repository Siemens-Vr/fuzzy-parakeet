'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewSection from '@/components/ReviewSection';

// Types
interface AppDetails {
  id: string;
  slug: string;
  name: string;
  version: string;
  summary: string;
  description: string;
  developer: {
    id: string;
    organizationName: string;
    isVerified: boolean;
  };
  category: string;
  subcategory: string | null;
  tags: string[];
  contentRating: string;
  price: number;
  currency: string;
  salePrice: number | null;
  saleEndDate: string | null;
  iconUrl: string | null;
  screenshots: string[];
  heroImageUrl: string | null;
  trailerUrl: string | null;
  promoVideoUrl: string | null;
  sizeBytes: number;
  minApiLevel: number;
  targetDevices: string[];
  permissions: string[];
  features: string[];
  whatsNew: string | null;
  languages: string[];
  privacyPolicyUrl: string | null;
  supportUrl: string | null;
  supportEmail: string | null;
  discordUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  requiresHandTracking: boolean;
  requiresPassthrough: boolean;
  requiresControllers: boolean;
  comfortLevel: string;
  playArea: string;
  playerModes: string[];
  estimatedPlayTime: string | null;
  ageRating: string | null;
  containsAds: boolean;
  hasInAppPurchases: boolean;
  inAppPurchaseInfo: string | null;
  credits: string | null;
  acknowledgments: string | null;
  status: string;
  publishedAt: string | null;
  lastUpdated: string;
  createdAt: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  viewCount: number;
  wishlistCount: number;
}

interface RelatedApp {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  price: number;
  currency: string;
  rating: number | null;
  ratingCount: number;
}

// ---- Types for lazy-loaded ADB libs ----
type AdbLibs = {
  Adb: any;
  AdbDaemonTransport: any;
  AdbDaemonWebUsbDeviceManager: any;
  AdbWebCredentialStore: any;
  PackageManager: any;
};

// Icon components
const StarIcon = ({ filled = false, half = false }: { filled?: boolean; half?: boolean }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    fill={filled || half ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const VerifiedIcon = () => (
  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Constants
const DEVICE_LABELS: Record<string, string> = {
  quest_2: 'Meta Quest 2',
  quest_3: 'Meta Quest 3',
  quest_3s: 'Meta Quest 3S',
  quest_pro: 'Meta Quest Pro',
  pico_4: 'PICO 4',
  pico_4_ultra: 'PICO 4 Ultra',
};

const PERMISSION_LABELS: Record<string, { label: string; icon: string }> = {
  INTERNET: { label: 'Internet', icon: '🌐' },
  MICROPHONE: { label: 'Microphone', icon: '🎤' },
  CAMERA: { label: 'Camera', icon: '📷' },
  STORAGE: { label: 'Storage', icon: '💾' },
  HAND_TRACKING: { label: 'Hand Tracking', icon: '✋' },
  EYE_TRACKING: { label: 'Eye Tracking', icon: '👁️' },
  FACE_TRACKING: { label: 'Face Tracking', icon: '😊' },
  BODY_TRACKING: { label: 'Body Tracking', icon: '🏃' },
  SPATIAL_DATA: { label: 'Spatial Data', icon: '🗺️' },
};

const CONTENT_RATING_INFO: Record<string, { label: string; color: string }> = {
  EVERYONE: { label: 'Everyone', color: 'bg-green-100 text-green-800' },
  TEEN: { label: 'Teen', color: 'bg-yellow-100 text-yellow-800' },
  MATURE: { label: 'Mature 17+', color: 'bg-orange-100 text-orange-800' },
  ADULT_ONLY: { label: 'Adults Only', color: 'bg-red-100 text-red-800' },
};

const COMFORT_INFO: Record<string, { label: string; color: string; icon: string }> = {
  COMFORTABLE: { label: 'Comfortable', color: 'bg-green-100 text-green-800', icon: '😊' },
  MODERATE: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800', icon: '😐' },
  INTENSE: { label: 'Intense', color: 'bg-red-100 text-red-800', icon: '🔥' },
};

const PLAY_AREA_INFO: Record<string, { label: string; icon: string }> = {
  SEATED: { label: 'Seated', icon: '🪑' },
  STANDING: { label: 'Standing', icon: '🧍' },
  ROOMSCALE: { label: 'Room-Scale', icon: '🏠' },
};

const PLAYER_MODE_LABELS: Record<string, string> = {
  SINGLE_PLAYER: 'Single Player',
  LOCAL_MULTIPLAYER: 'Local Multiplayer',
  ONLINE_MULTIPLAYER: 'Online Multiplayer',
  CO_OP: 'Co-op',
  PVP: 'PvP',
};

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (price: number, currency: string): string => {
  if (price === 0) return 'Free';
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh ',
    NGN: '₦',
    GHS: 'GH₵',
    ZAR: 'R',
  };
  return `${symbols[currency] || currency + ' '}${price.toFixed(2)}`;
};

// Star rating component
const StarRating = ({ rating, count }: { rating: number; count: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<StarIcon key={i} filled />);
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<StarIcon key={i} half />);
    } else {
      stars.push(<StarIcon key={i} />);
    }
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-gray-600 ml-1">{rating?.toFixed(1) || 'N/A'}</span>
      <span className="text-gray-400">({formatNumber(count)} reviews)</span>
    </div>
  );
};

export default function AppDetailsPage() {
  const params = useParams();

  const [app, setApp] = useState<AppDetails | null>(null);
  const [relatedApps, setRelatedApps] = useState<RelatedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'related'>('about');
  const [selectedScreenshot, setSelectedScreenshot] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);

  // ---- Auth state ----
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ---- Sideload State ----
  const [busy, setBusy] = useState(false);
  const [sideloadLog, setSideloadLog] = useState<string>('');
  const adbRef = useRef<any>(null);
  const libsRef = useRef<AdbLibs | null>(null);

  // ---- Browser checks for WebUSB ----
  const webUsbSupported = useMemo(
    () => typeof navigator !== 'undefined' && !!(navigator as any).usb,
    []
  );
  const isChromeOrEdge = useMemo(
    () => typeof navigator !== 'undefined' && /chrome|chromium|edg/i.test(navigator.userAgent),
    []
  );
  const isQuestBrowser = useMemo(
    () => typeof navigator !== 'undefined' && /OculusBrowser/i.test(navigator.userAgent),
    []
  );

  const appendLog = (line: string) =>
    setSideloadLog((prev) => (prev ? prev + '\n' : '') + line);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/public/apps/${params.slug}`);
        const data = await res.json();
        console.log('app gotten', data);

        if (res.ok && !data.error) {
          setApp(data);
        } else {
          setApp(null);
        }
      } catch (error) {
        console.error('Error fetching app:', error);
        setApp(null);
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

    fetchApp();
    checkAuthStatus();
  }, [params.slug]);

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

    const { Adb, AdbDaemonTransport, AdbWebCredentialStore, AdbDaemonWebUsbDeviceManager } =
      await loadLibs();
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
    appendLog(`✅ Connected: ${device.serial ?? '(no serial)'}`);
    return adb;
  }, [loadLibs, webUsbSupported, isChromeOrEdge, isQuestBrowser]);

  // ---------- Fetch APK ----------
  const fetchApkFile = useCallback(async (): Promise<Response> => {
    appendLog('📥 Fetching APK for sideloading…');
    const res = await fetch(`/api/download/${params.slug}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
    return res;
  }, [params.slug]);

  // ---------- Push & Install ----------
  const pushAndInstallApk = useCallback(
    async (adb: any, response: Response) => {
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
    },
    [loadLibs]
  );

  // ---- Download Handler (login required) ----
  const handleDownload = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    window.location.href = `/api/download/${params.slug}`;
  }, [isLoggedIn, params.slug]);

  // ---- Sideload Handler (login required) ----
  const handleSideload = useCallback(async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

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
  }, [isLoggedIn, isChromeOrEdge, isQuestBrowser, connectQuest, fetchApkFile, pushAndInstallApk]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">App Not Found</h1>
          <Link href="/apps" className="text-purple-400 hover:text-purple-300">
            Browse all apps →
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = app.salePrice && app.salePrice < app.price;
  const discountPercent = hasDiscount ? Math.round((1 - app.salePrice! / app.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* LOGIN MODAL (for download/sideload) */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginPrompt(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl"
            >
              <div className="text-5xl mb-2">🔐</div>
              <h2 className="text-xl font-extrabold mb-2 text-gray-900">Sign In Required</h2>
              <p className="text-sm text-slate-500 mb-6">
                You need to sign in to download or sideload apps from our store.
              </p>
              <Link href={`/auth/user/login?redirect=/apps/${params.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Background */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-[500px]">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: app.heroImageUrl
                ? `url(${app.heroImageUrl})`
                : app.screenshots?.[0]
                ? `url(${app.screenshots[0]})`
                : undefined,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/apps" className="hover:text-white">
              Apps
            </Link>
            <span>/</span>
            <Link
              href={`/apps?category=${app.category}`}
              className="hover:text-white capitalize"
            >
              {app.category.toLowerCase()}
            </Link>
            <span>/</span>
            <span className="text-white">{app.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: App Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                {/* App Icon */}
                <div className="w-32 h-32 rounded-2xl bg-gray-800 overflow-hidden shadow-2xl flex-shrink-0 border-2 border-gray-700">
                  {app.iconUrl ? (
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                      {app.name[0]}
                    </div>
                  )}
                </div>

                {/* App Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        CONTENT_RATING_INFO[app.contentRating]?.color ||
                        'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {CONTENT_RATING_INFO[app.contentRating]?.label || app.contentRating}
                    </span>
                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 truncate">
                    {app.name}
                  </h1>

                  <div className="flex items-center gap-3 mb-3">
                    <Link
                      href={`/developer/${app.developer.id}`}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                    >
                      {app.developer.organizationName}
                      {app.developer.isVerified && <VerifiedIcon />}
                    </Link>
                  </div>

                  <p className="text-gray-300 text-lg mb-4">{app.summary}</p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <StarRating rating={app.rating || 0} count={app.ratingCount} />
                    <div className="flex items-center gap-1 text-gray-400">
                      <DownloadIcon />
                      <span>{formatNumber(app.downloads)} downloads</span>
                    </div>
                    <div className="text-gray-400">{formatFileSize(app.sizeBytes)}</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {app.tags && app.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {app.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/apps?tag=${tag}`}
                      className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Purchase / Download / Sideload Card */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-gray-800/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-700">
                {/* Price */}
                <div className="mb-4">
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">
                        {formatPrice(app.salePrice!, app.currency)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(app.price, app.currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(app.price, app.currency)}
                    </span>
                  )}
                  {hasDiscount && app.saleEndDate && (
                    <p className="text-sm text-green-400 mt-1">
                      Sale ends {formatDate(app.saleEndDate)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* If already purchased you might just show Install */}
                  {isPurchased ? (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      <DownloadIcon />
                      Install
                    </button>
                  ) : (
                    <>
                      {/* BUY NOW only if paid app */}
                      {app.price > 0 && (
                        <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]">
                          Buy Now
                        </button>
                      )}

                      {/* Download + Sideload row – shown for both free & paid */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleDownload}
                          className="flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 bg-gray-700 text-gray-100 hover:bg-gray-600 text-sm font-medium"
                        >
                          ⬇️ Download now
                        </button>
                        <button
                          onClick={handleSideload}
                          disabled={busy || !isChromeOrEdge}
                          className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium ${
                            busy
                              ? 'bg-purple-900/60 text-gray-200 cursor-wait'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                          } ${!isChromeOrEdge ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          🎯 {busy ? 'Sideloading…' : 'Sideload now'}
                        </button>
                      </div>
                    </>
                  )}

                  {/* Wishlist / Share */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        isWishlisted
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <HeartIcon filled={isWishlisted} />
                      <span className="text-sm">
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </span>
                    </button>
                    <button className="py-2 px-4 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors">
                      <ShareIcon />
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-gray-700 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">{app.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated</span>
                    <span className="text-white">{formatDate(app.lastUpdated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size</span>
                    <span className="text-white">{formatFileSize(app.sizeBytes)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Comfort</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        COMFORT_INFO[app.comfortLevel]?.color || 'bg-gray-700'
                      }`}
                    >
                      {COMFORT_INFO[app.comfortLevel]?.icon}{' '}
                      {COMFORT_INFO[app.comfortLevel]?.label || app.comfortLevel}
                    </span>
                  </div>
                </div>

                {/* In-app purchases notice */}
                {app.hasInAppPurchases && (
                  <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-400 text-xs">💰 Contains in-app purchases</p>
                  </div>
                )}

                {/* Sideload log (optional debugging info) */}
                {sideloadLog && (
                  <pre className="mt-4 max-h-40 overflow-auto text-xs bg-black/60 text-gray-200 rounded-lg p-3 whitespace-pre-wrap">
                    {sideloadLog}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots & Media Section */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative">
            {/* Main Screenshot/Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800 mb-4">
              {showTrailer && app.trailerUrl ? (
                <iframe
                  src={app.trailerUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={app.screenshots[selectedScreenshot] || '/placeholder.jpg'}
                    alt={`${app.name} screenshot ${selectedScreenshot + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {app.trailerUrl && selectedScreenshot === 0 && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayIcon />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {app.trailerUrl && (
                <button
                  onClick={() => {
                    setShowTrailer(true);
                    setSelectedScreenshot(0);
                  }}
                  className={`relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    showTrailer ? 'border-purple-500' : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <img
                    src={app.screenshots[0] || '/placeholder.jpg'}
                    alt="Trailer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
              {app.screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setShowTrailer(false);
                    setSelectedScreenshot(index);
                  }}
                  className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    !showTrailer && selectedScreenshot === index
                      ? 'border-purple-500'
                      : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'about', label: 'About' },
              { id: 'reviews', label: `Reviews (${formatNumber(app.ratingCount)})` },
              { id: 'related', label: 'Related Apps' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4">About this app</h2>
                <div
                  className={`prose prose-invert max-w-none ${
                    !expandDescription && 'line-clamp-6'
                  }`}
                >
                  <p className="text-gray-300 whitespace-pre-wrap">{app.description}</p>
                </div>
                {app.description.length > 500 && (
                  <button
                    onClick={() => setExpandDescription(!expandDescription)}
                    className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    {expandDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </section>

              {/* What's New */}
              {app.whatsNew && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-4">What&apos;s New</h2>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                        v{app.version}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {formatDate(app.lastUpdated)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.whatsNew}</p>
                  </div>
                </section>
              )}

              {/* Features */}
              {app.features && app.features.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {app.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckIcon />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Credits */}
              {(app.credits || app.acknowledgments) && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Credits</h2>
                  <div className="bg-gray-800 rounded-xl p-4 space-y-3 text-gray-300 text-sm">
                    {app.credits && <p>{app.credits}</p>}
                    {app.acknowledgments && (
                      <p className="text-gray-400">{app.acknowledgments}</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Compatibility */}
              <section className="bg-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">Compatibility</h3>

                {/* Devices */}
                {app.targetDevices && app.targetDevices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Supported Devices</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.targetDevices.map((device) => (
                        <span
                          key={device}
                          className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full"
                        >
                          {DEVICE_LABELS[device] || device}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Play Area & Comfort */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Play Area</h4>
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xl">
                        {PLAY_AREA_INFO[app.playArea]?.icon || '🎮'}
                      </span>
                      <span>{PLAY_AREA_INFO[app.playArea]?.label || app.playArea}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Comfort</h4>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                        COMFORT_INFO[app.comfortLevel]?.color || 'bg-gray-700'
                      }`}
                    >
                      <span>{COMFORT_INFO[app.comfortLevel]?.icon || '😊'}</span>
                      <span>
                        {COMFORT_INFO[app.comfortLevel]?.label || app.comfortLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hardware Requirements */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresControllers ? (
                        <CheckIcon />
                      ) : (
                        <span className="w-5 h-5 text-gray-600">✕</span>
                      )}
                      <span>
                        Controllers {app.requiresControllers ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresHandTracking ? (
                        <CheckIcon />
                      ) : (
                        <span className="w-5 h-5 text-gray-600">✕</span>
                      )}
                      <span>
                        Hand Tracking {app.requiresHandTracking ? 'Required' : 'Supported'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresPassthrough ? (
                        <CheckIcon />
                      ) : (
                        <span className="w-5 h-5 text-gray-600">✕</span>
                      )}
                      <span>
                        Passthrough {app.requiresPassthrough ? 'Required' : 'Not Required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player Modes */}
                {app.playerModes && app.playerModes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Player Modes</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.playerModes.map((mode) => (
                        <span
                          key={mode}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {PLAYER_MODE_LABELS[mode] || mode}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Permissions */}
              {app.permissions && app.permissions.length > 0 && (
                <section className="bg-gray-800 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Permissions</h3>
                  <div className="space-y-2">
                    {app.permissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center gap-2 text-gray-300 text-sm"
                      >
                        <span>{PERMISSION_LABELS[perm]?.icon || '🔒'}</span>
                        <span>{PERMISSION_LABELS[perm]?.label || perm}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {app.languages && app.languages.length > 0 && (
                <section className="bg-gray-800 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Languages</h3>
                  <p className="text-gray-300 text-sm">
                    {app.languages
                      .map((lang) => {
                        const names: Record<string, string> = {
                          en: 'English',
                          es: 'Spanish',
                          fr: 'French',
                          de: 'German',
                          ja: 'Japanese',
                          ko: 'Korean',
                          zh: 'Chinese',
                          pt: 'Portuguese',
                          ar: 'Arabic',
                          sw: 'Swahili',
                        };
                        return names[lang] || lang;
                      })
                      .join(', ')}
                  </p>
                </section>
              )}

              {/* Support Links */}
              <section className="bg-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">Support & Links</h3>
                <div className="space-y-3">
                  {app.supportUrl && (
                    <a
                      href={app.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <span>🌐</span> Support Website
                    </a>
                  )}
                  {app.supportEmail && (
                    <a
                      href={`mailto:${app.supportEmail}`}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <span>✉️</span> {app.supportEmail}
                    </a>
                  )}
                  {app.discordUrl && (
                    <a
                      href={app.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <span>💬</span> Discord Community
                    </a>
                  )}
                  {app.twitterUrl && (
                    <a
                      href={app.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <span>🐦</span> Twitter/X
                    </a>
                  )}
                  {app.youtubeUrl && (
                    <a
                      href={app.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <span>📺</span> YouTube Channel
                    </a>
                  )}
                  {app.privacyPolicyUrl && (
                    <a
                      href={app.privacyPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm"
                    >
                      <span>🔒</span> Privacy Policy
                    </a>
                  )}
                </div>
              </section>

              {/* Additional Info */}
              <section className="bg-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">Additional Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white capitalize">
                      {app.category.toLowerCase()}
                    </span>
                  </div>
                  {app.subcategory && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subcategory</span>
                      <span className="text-white">{app.subcategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Content Rating</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        CONTENT_RATING_INFO[app.contentRating]?.color || 'bg-gray-700'
                      }`}
                    >
                      {CONTENT_RATING_INFO[app.contentRating]?.label || app.contentRating}
                    </span>
                  </div>
                  {app.estimatedPlayTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Play Time</span>
                      <span className="text-white">{app.estimatedPlayTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min API Level</span>
                    <span className="text-white">Android {app.minApiLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Released</span>
                    <span className="text-white">
                      {app.publishedAt ? formatDate(app.publishedAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            <ReviewSection appSlug={app.slug} />
          </div>
        )}

        {activeTab === 'related' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Similar Apps You Might Like</h2>
            {relatedApps.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedApps.map((relatedApp) => (
                  <Link
                    key={relatedApp.id}
                    href={`/apps/${relatedApp.slug}`}
                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors group"
                  >
                    <div className="w-full aspect-square rounded-xl bg-gray-700 mb-3 overflow-hidden">
                      {relatedApp.iconUrl ? (
                        <img
                          src={relatedApp.iconUrl}
                          alt={relatedApp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                          {relatedApp.name[0]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-white truncate">{relatedApp.name}</h3>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <StarIcon filled />
                      <span className="text-gray-400">
                        {relatedApp.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div className="text-purple-400 font-medium mt-2">
                      {formatPrice(relatedApp.price, relatedApp.currency)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No related apps found
                </h3>
                <p className="text-gray-400">Check back later for recommendations</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA (Mobile sticky) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">
                  {formatPrice(app.salePrice!, app.currency)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(app.price, app.currency)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-white">
                {formatPrice(app.price, app.currency)}
              </span>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl"
          >
            {app.price === 0 ? 'Download now' : 'Buy / Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
