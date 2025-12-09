'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { AppDetails, UserReview, RelatedApp } from '@/types/app-details';

// Icon components
const StarIcon = ({ filled = false, half = false }: { filled?: boolean; half?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill={filled || half ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    {half ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    )}
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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

// Device icons
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

// Format utilities
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
    USD: '$', EUR: '€', GBP: '£', KES: 'KSh ', NGN: '₦', GHS: 'GH₵', ZAR: 'R',
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

// Mock data for demonstration
const MOCK_APP: AppDetails = {
  id: '1',
  slug: 'beat-saber-demo',
  name: 'Beat Saber VR',
  version: '1.29.1',
  summary: 'Slash the beats, feel the rhythm in this award-winning VR game',
  description: `# Beat Saber VR

Beat Saber is an immersive rhythm experience you have never seen before! Enjoy tons of handcrafted levels and all-new music packs.

## Features

- **Handcrafted Levels** - Each level is carefully designed to match the music
- **Campaign Mode** - Progress through increasingly challenging missions  
- **Online Leaderboards** - Compete with players worldwide
- **Custom Songs** - Add your own music (via mods)
- **Multiplayer** - Play with friends online

## Gameplay

Use your sabers to slash the beats as they come flying at you – every beat indicates which saber you need to use and the direction you need to match. 

All songs are carefully handcrafted to enhance the gameplay experience. Put on your VR headset and immerse yourself in the rhythm!

## Perfect for Exercise

Beat Saber is not just a game – it's a full-body workout! Burn calories while having fun and improving your reflexes.`,
  developer: {
    id: 'dev1',
    organizationName: 'Beat Games',
    isVerified: true,
  },
  category: 'GAMES',
  subcategory: 'Rhythm',
  tags: ['rhythm', 'music', 'exercise', 'lightsabers', 'arcade', 'fitness'],
  contentRating: 'EVERYONE',
  price: 29.99,
  currency: 'USD',
  salePrice: 19.99,
  saleEndDate: '2025-12-31',
  iconUrl: '/placeholder-icon.png',
  screenshots: [
    '/screenshot1.jpg',
    '/screenshot2.jpg',
    '/screenshot3.jpg',
    '/screenshot4.jpg',
    '/screenshot5.jpg',
  ],
  heroImageUrl: '/hero-image.jpg',
  trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  promoVideoUrl: '',
  sizeBytes: 1258291200,
  minApiLevel: 29,
  targetDevices: ['quest_2', 'quest_3', 'quest_3s', 'quest_pro'],
  permissions: ['STORAGE', 'INTERNET', 'HAND_TRACKING'],
  features: [
    'VR Motion Controls',
    'Haptic Feedback',
    'Spatial Audio',
    'Online Leaderboards',
    'Achievements',
    'Cloud Saves',
    'Controller Support',
    'Hand Tracking Support',
  ],
  whatsNew: `## Version 1.29.1
- Added 5 new songs in the Electronic Mixtape pack
- Fixed tracking issues on Quest 3
- Improved haptic feedback
- Performance optimizations
- Bug fixes and stability improvements`,
  languages: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'],
  privacyPolicyUrl: 'https://beatsaber.com/privacy',
  supportUrl: 'https://beatsaber.com/support',
  supportEmail: 'support@beatsaber.com',
  discordUrl: 'https://discord.gg/beatsaber',
  twitterUrl: 'https://twitter.com/beaborern',
  youtubeUrl: 'https://youtube.com/beatsaber',
  requiresHandTracking: false,
  requiresPassthrough: false,
  requiresControllers: true,
  comfortLevel: 'MODERATE',
  playArea: 'STANDING',
  playerModes: ['SINGLE_PLAYER', 'ONLINE_MULTIPLAYER'],
  estimatedPlayTime: 'Endless',
  ageRating: 'E for Everyone',
  containsAds: false,
  hasInAppPurchases: true,
  inAppPurchaseInfo: 'Music packs available for $9.99-$12.99 each',
  credits: 'Developed by Beat Games, a studio of Beat Saber ApS',
  acknowledgments: 'Special thanks to our amazing community',
  status: 'PUBLISHED',
  publishedAt: '2019-05-21',
  lastUpdated: '2024-11-15',
  createdAt: '2019-04-01',
  rating: 4.8,
  ratingCount: 125420,
  downloads: 2500000,
  viewCount: 15000000,
  wishlistCount: 45000,
};

const MOCK_REVIEWS: UserReview[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'VRGamer42',
    rating: 5,
    title: 'Best VR game ever made!',
    content: 'I\'ve played hundreds of hours and still not bored. The new songs keep it fresh and the exercise is a bonus!',
    helpful: 234,
    verified: true,
    createdAt: '2024-11-10',
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'CasualPlayer',
    rating: 4,
    title: 'Great but expensive DLC',
    content: 'The base game is amazing but you need to buy song packs to get the full experience. Still worth it though.',
    helpful: 89,
    verified: true,
    createdAt: '2024-11-05',
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'FitnessEnthusiast',
    rating: 5,
    title: 'Lost 20 pounds playing this!',
    content: 'I play expert+ levels for an hour every day and it\'s the best workout I\'ve ever had. Who knew exercise could be this fun?',
    helpful: 156,
    verified: true,
    createdAt: '2024-10-28',
  },
];

const MOCK_RELATED: RelatedApp[] = [
  { id: '2', slug: 'synth-riders', name: 'Synth Riders', iconUrl: '/icon2.png', price: 24.99, currency: 'USD', rating: 4.6, ratingCount: 45000 },
  { id: '3', slug: 'pistol-whip', name: 'Pistol Whip', iconUrl: '/icon3.png', price: 29.99, currency: 'USD', rating: 4.7, ratingCount: 32000 },
  { id: '4', slug: 'audio-trip', name: 'Audio Trip', iconUrl: '/icon4.png', price: 19.99, currency: 'USD', rating: 4.4, ratingCount: 12000 },
  { id: '5', slug: 'ragnarock', name: 'Ragnaröck', iconUrl: '/icon5.png', price: 24.99, currency: 'USD', rating: 4.5, ratingCount: 8000 },
];

export default function AppDetailsPage() {
  const params = useParams();
  const [app, setApp] = useState<AppDetails | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [relatedApps, setRelatedApps] = useState<RelatedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'related'>('about');
  const [selectedScreenshot, setSelectedScreenshot] = useState<number>(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [expandDescription, setExpandDescription] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    // const fetchApp = async () => {
    //   const res = await fetch(`/api/apps/${params.slug}`);
    //   const data = await res.json();
    //   setApp(data);
    // };
    
    // Using mock data for demonstration
    setTimeout(() => {
      setApp(MOCK_APP);
      setReviews(MOCK_REVIEWS);
      setRelatedApps(MOCK_RELATED);
      setLoading(false);
    }, 500);
  }, [params.slug]);

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
  const displayPrice = hasDiscount ? app.salePrice! : app.price;
  const discountPercent = hasDiscount ? Math.round((1 - app.salePrice! / app.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section with Background */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0 h-[500px]">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: app.heroImageUrl ? `url(${app.heroImageUrl})` : `url(${app.screenshots[0]})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/apps" className="hover:text-white">Apps</Link>
            <span>/</span>
            <Link href={`/apps?category=${app.category}`} className="hover:text-white capitalize">
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
                    <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                      {app.name[0]}
                    </div>
                  )}
                </div>

                {/* App Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CONTENT_RATING_INFO[app.contentRating]?.color || 'bg-gray-700 text-gray-300'}`}>
                      {CONTENT_RATING_INFO[app.contentRating]?.label || app.contentRating}
                    </span>
                    {hasDiscount && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500 text-white">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 truncate">{app.name}</h1>
                  
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
                    <div className="text-gray-400">
                      {formatFileSize(app.sizeBytes)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                {app.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/apps?tag=${tag}`}
                    className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Purchase Card */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-gray-800/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-gray-700">
                {/* Price */}
                <div className="mb-4">
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{formatPrice(app.salePrice!, app.currency)}</span>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(app.price, app.currency)}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-white">{formatPrice(app.price, app.currency)}</span>
                  )}
                  {hasDiscount && app.saleEndDate && (
                    <p className="text-sm text-green-400 mt-1">
                      Sale ends {formatDate(app.saleEndDate)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isPurchased ? (
                    <button className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                      <DownloadIcon />
                      Install
                    </button>
                  ) : (
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02]">
                      {app.price === 0 ? 'Get Free' : 'Buy Now'}
                    </button>
                  )}
                  
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
                      <span className="text-sm">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
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
                    <span className={`px-2 py-0.5 rounded text-xs ${COMFORT_INFO[app.comfortLevel]?.color}`}>
                      {COMFORT_INFO[app.comfortLevel]?.icon} {COMFORT_INFO[app.comfortLevel]?.label}
                    </span>
                  </div>
                </div>

                {/* In-app purchases notice */}
                {app.hasInAppPurchases && (
                  <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-400 text-xs">
                      💰 Contains in-app purchases
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots & Media Section */}
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

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'about', label: 'About' },
              { id: 'reviews', label: `Reviews (${formatNumber(app.ratingCount)})` },
              { id: 'related', label: 'Related Apps' },
            ].map(tab => (
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
                <div className={`prose prose-invert max-w-none ${!expandDescription && 'line-clamp-6'}`}>
                  <div 
                    className="text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: app.description
                        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-3">$1</h1>')
                        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                    }}
                  />
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
                      <span className="text-gray-400 text-sm">{formatDate(app.lastUpdated)}</span>
                    </div>
                    <div 
                      className="text-gray-300 text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: app.whatsNew
                          .replace(/^## (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-3 mb-2">$1</h3>')
                          .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
                      }}
                    />
                  </div>
                </section>
              )}

              {/* Features */}
              {app.features.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-white mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {app.features.map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-gray-300">
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
                    {app.acknowledgments && <p className="text-gray-400">{app.acknowledgments}</p>}
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
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Supported Devices</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.targetDevices.map(device => (
                      <span key={device} className="px-3 py-1 bg-gray-700 text-white text-sm rounded-full">
                        {DEVICE_LABELS[device] || device}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Play Area & Comfort */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Play Area</h4>
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xl">{PLAY_AREA_INFO[app.playArea]?.icon}</span>
                      <span>{PLAY_AREA_INFO[app.playArea]?.label}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Comfort</h4>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${COMFORT_INFO[app.comfortLevel]?.color}`}>
                      <span>{COMFORT_INFO[app.comfortLevel]?.icon}</span>
                      <span>{COMFORT_INFO[app.comfortLevel]?.label}</span>
                    </div>
                  </div>
                </div>

                {/* Hardware Requirements */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresControllers ? <CheckIcon /> : <span className="w-5 h-5 text-gray-600">✕</span>}
                      <span>Controllers {app.requiresControllers ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresHandTracking ? <CheckIcon /> : <span className="w-5 h-5 text-gray-600">✕</span>}
                      <span>Hand Tracking {app.requiresHandTracking ? 'Required' : 'Supported'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      {app.requiresPassthrough ? <CheckIcon /> : <span className="w-5 h-5 text-gray-600">✕</span>}
                      <span>Passthrough {app.requiresPassthrough ? 'Required' : 'Not Required'}</span>
                    </div>
                  </div>
                </div>

                {/* Player Modes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Player Modes</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.playerModes.map(mode => (
                      <span key={mode} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {PLAYER_MODE_LABELS[mode] || mode}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Permissions */}
              {app.permissions.length > 0 && (
                <section className="bg-gray-800 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-white mb-4">Permissions</h3>
                  <div className="space-y-2">
                    {app.permissions.map(perm => (
                      <div key={perm} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span>{PERMISSION_LABELS[perm]?.icon || '🔒'}</span>
                        <span>{PERMISSION_LABELS[perm]?.label || perm}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              <section className="bg-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">Languages</h3>
                <p className="text-gray-300 text-sm">
                  {app.languages.map(lang => {
                    const names: Record<string, string> = {
                      en: 'English', es: 'Spanish', fr: 'French', de: 'German',
                      ja: 'Japanese', ko: 'Korean', zh: 'Chinese', pt: 'Portuguese',
                      ar: 'Arabic', sw: 'Swahili'
                    };
                    return names[lang] || lang;
                  }).join(', ')}
                </p>
              </section>

              {/* Support Links */}
              <section className="bg-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-4">Support & Links</h3>
                <div className="space-y-3">
                  {app.supportUrl && (
                    <a href={app.supportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
                      <span>🌐</span> Support Website
                    </a>
                  )}
                  {app.supportEmail && (
                    <a href={`mailto:${app.supportEmail}`} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
                      <span>✉️</span> {app.supportEmail}
                    </a>
                  )}
                  {app.discordUrl && (
                    <a href={app.discordUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
                      <span>💬</span> Discord Community
                    </a>
                  )}
                  {app.twitterUrl && (
                    <a href={app.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
                      <span>🐦</span> Twitter/X
                    </a>
                  )}
                  {app.youtubeUrl && (
                    <a href={app.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
                      <span>📺</span> YouTube Channel
                    </a>
                  )}
                  {app.privacyPolicyUrl && (
                    <a href={app.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm">
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
                    <span className="text-white capitalize">{app.category.toLowerCase()}</span>
                  </div>
                  {app.subcategory && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subcategory</span>
                      <span className="text-white">{app.subcategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Content Rating</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${CONTENT_RATING_INFO[app.contentRating]?.color}`}>
                      {CONTENT_RATING_INFO[app.contentRating]?.label}
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
                    <span className="text-white">{app.publishedAt ? formatDate(app.publishedAt) : 'N/A'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-3xl">
            {/* Rating Summary */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{app.rating?.toFixed(1) || 'N/A'}</div>
                  <div className="flex justify-center my-2">
                    <StarRating rating={app.rating || 0} count={0} />
                  </div>
                  <div className="text-gray-400 text-sm">{formatNumber(app.ratingCount)} reviews</div>
                </div>
                
                {/* Rating Distribution */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const percentage = stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 6 : stars === 2 ? 2 : 2;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-3">{stars}</span>
                        <StarIcon filled />
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-400 w-10">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Write Review Button */}
            <div className="mb-6">
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors">
                Write a Review
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{review.userName}</span>
                        {review.verified && (
                          <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <StarIcon key={star} filled={star <= review.rating} />
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium text-white mb-2">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-gray-300 text-sm mb-4">{review.content}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <button className="text-gray-400 hover:text-white flex items-center gap-1">
                      <span>👍</span>
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-6 text-center">
              <button className="px-6 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors">
                Load More Reviews
              </button>
            </div>
          </div>
        )}

        {activeTab === 'related' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Similar Apps You Might Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedApps.map(relatedApp => (
                <Link
                  key={relatedApp.id}
                  href={`/apps/${relatedApp.slug}`}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors group"
                >
                  <div className="w-full aspect-square rounded-xl bg-gray-700 mb-3 overflow-hidden">
                    {relatedApp.iconUrl ? (
                      <img src={relatedApp.iconUrl} alt={relatedApp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-600 to-blue-600">
                        {relatedApp.name[0]}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-white truncate">{relatedApp.name}</h3>
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <StarIcon filled />
                    <span className="text-gray-400">{relatedApp.rating?.toFixed(1)}</span>
                  </div>
                  <div className="text-purple-400 font-medium mt-2">
                    {formatPrice(relatedApp.price, relatedApp.currency)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA (Mobile sticky) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{formatPrice(app.salePrice!, app.currency)}</span>
                <span className="text-sm text-gray-500 line-through">{formatPrice(app.price, app.currency)}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-white">{formatPrice(app.price, app.currency)}</span>
            )}
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl">
            {app.price === 0 ? 'Get Free' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}