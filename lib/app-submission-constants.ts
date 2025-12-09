import type {
  AppFormData,
  FormStep,
  CategoryOption,
  DeviceOption,
  PermissionOption,
  SelectOption,
  CurrencyOption,
  LanguageOption,
} from '@/types/app-submission';

export const INITIAL_FORM_DATA: AppFormData = {
  name: '',
  slug: '',
  summary: '',
  description: '',
  category: '',
  subcategory: '',
  tags: [],
  price: 0,
  currency: 'USD',
  salePrice: null,
  saleEndDate: null,
  version: '1.0.0',
  minApiLevel: 29,
  targetDevices: [],
  permissions: [],
  sizeBytes: 0,
  requiresHandTracking: false,
  requiresPassthrough: false,
  requiresControllers: true,
  apkFile: null,
  iconFile: null,
  screenshots: [],
  heroImageFile: null,
  trailerUrl: '',
  promoVideoUrl: '',
  contentRating: 'EVERYONE',
  comfortLevel: 'COMFORTABLE',
  playArea: 'STATIONARY',
  playerModes: ['SINGLE_PLAYER'],
  estimatedPlayTime: '',
  ageRating: '',
  containsAds: false,
  hasInAppPurchases: false,
  inAppPurchaseInfo: '',
  features: [],
  whatsNew: '',
  languages: ['en'],
  privacyPolicyUrl: '',
  supportUrl: '',
  supportEmail: '',
  discordUrl: '',
  twitterUrl: '',
  youtubeUrl: '',
  developerNotes: '',
  credits: '',
  acknowledgments: '',
};

export const STEPS: FormStep[] = [
  { id: 1, title: 'Basic Info', description: 'Name, description, and category' },
  { id: 2, title: 'Pricing', description: 'Set your price and currency' },
  { id: 3, title: 'Technical', description: 'Device support and permissions' },
  { id: 4, title: 'Media', description: 'APK, icon, and screenshots' },
  { id: 5, title: 'Content', description: 'Ratings and comfort settings' },
  { id: 6, title: 'Features', description: 'Features and languages' },
  { id: 7, title: 'Support', description: 'Contact and social links' },
  { id: 8, title: 'Review', description: 'Review and submit' },
];

export const CATEGORIES: CategoryOption[] = [
  { value: 'games', label: 'Games', subcategories: ['Action', 'Adventure', 'Puzzle', 'Simulation', 'Sports', 'Racing', 'RPG', 'Strategy', 'Horror', 'Casual', 'Rhythm', 'Fighting', 'Shooter'] },
  { value: 'apps', label: 'Apps', subcategories: ['Productivity', 'Social', 'Education', 'Entertainment', 'Utilities', 'Health & Fitness', 'Media', 'Travel'] },
  { value: 'experiences', label: 'Experiences', subcategories: ['Exploration', 'Meditation', 'Art', 'Music', 'Nature', 'Space', 'Historical', 'Documentary'] },
  { value: 'tools', label: 'Tools', subcategories: ['Development', 'Design', 'Utilities', 'File Management', 'System'] },
];

export const TARGET_DEVICES: DeviceOption[] = [
  { value: 'quest_2', label: 'Meta Quest 2' },
  { value: 'quest_3', label: 'Meta Quest 3' },
  { value: 'quest_3s', label: 'Meta Quest 3S' },
  { value: 'quest_pro', label: 'Meta Quest Pro' },
  { value: 'pico_4', label: 'PICO 4' },
  { value: 'pico_4_ultra', label: 'PICO 4 Ultra' },
];

export const PERMISSIONS: PermissionOption[] = [
  { value: 'INTERNET', label: 'Internet Access', description: 'Access network resources' },
  { value: 'MICROPHONE', label: 'Microphone', description: 'Record audio' },
  { value: 'CAMERA', label: 'Camera/Passthrough', description: 'Access device cameras' },
  { value: 'STORAGE', label: 'Storage', description: 'Read/write files' },
  { value: 'HAND_TRACKING', label: 'Hand Tracking', description: 'Track hand movements' },
  { value: 'EYE_TRACKING', label: 'Eye Tracking', description: 'Track eye movements (Quest Pro)' },
  { value: 'FACE_TRACKING', label: 'Face Tracking', description: 'Track facial expressions' },
  { value: 'BODY_TRACKING', label: 'Body Tracking', description: 'Track body movements' },
  { value: 'SPATIAL_DATA', label: 'Spatial Data', description: 'Access room mapping data' },
];

export const CONTENT_RATINGS: SelectOption[] = [
  { value: 'EVERYONE', label: 'Everyone', description: 'Suitable for all ages' },
  { value: 'EVERYONE_10', label: 'Everyone 10+', description: 'Suitable for ages 10 and up' },
  { value: 'TEEN', label: 'Teen', description: 'Suitable for ages 13 and up' },
  { value: 'MATURE', label: 'Mature 17+', description: 'Suitable for ages 17 and up' },
  { value: 'ADULTS_ONLY', label: 'Adults Only', description: 'Suitable for ages 18 and up' },
];

export const COMFORT_LEVELS: SelectOption[] = [
  { value: 'COMFORTABLE', label: 'Comfortable', description: 'Minimal motion, suitable for VR beginners' },
  { value: 'MODERATE', label: 'Moderate', description: 'Some motion, may affect sensitive users' },
  { value: 'INTENSE', label: 'Intense', description: 'Significant motion, recommended for experienced VR users' },
];

export const PLAY_AREAS: SelectOption[] = [
  { value: 'STATIONARY', label: 'Stationary', description: 'Play while seated or standing still' },
  { value: 'ROOMSCALE', label: 'Room-Scale', description: 'Requires space to move around' },
  { value: 'BOTH', label: 'Both Supported', description: 'Works in stationary or room-scale' },
];

export const PLAYER_MODES: SelectOption[] = [
  { value: 'SINGLE_PLAYER', label: 'Single Player' },
  { value: 'LOCAL_MULTIPLAYER', label: 'Local Multiplayer' },
  { value: 'ONLINE_MULTIPLAYER', label: 'Online Multiplayer' },
  { value: 'CO_OP', label: 'Co-op' },
  { value: 'PVP', label: 'PvP' },
];

export const CURRENCIES: CurrencyOption[] = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'GHS', label: 'Ghanaian Cedi (GH₵)', symbol: 'GH₵' },
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
];

export const LANGUAGES: LanguageOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'sw', label: 'Swahili' },
];

export const COMMON_FEATURES: string[] = [
  'VR Motion Controls',
  'Hand Tracking Support',
  'Voice Commands',
  'Haptic Feedback',
  'Spatial Audio',
  'Cross-Platform Save',
  'Cloud Saves',
  'Leaderboards',
  'Achievements',
  'Mixed Reality',
  'Passthrough Mode',
  'Seated Mode',
  'Standing Mode',
  'Room-Scale',
  'Controller Support',
  'Gamepad Support',
];

export const API_LEVELS = [
  { value: 29, label: 'API 29 (Android 10)' },
  { value: 30, label: 'API 30 (Android 11)' },
  { value: 31, label: 'API 31 (Android 12)' },
  { value: 32, label: 'API 32 (Android 12L)' },
  { value: 33, label: 'API 33 (Android 13)' },
  { value: 34, label: 'API 34 (Android 14)' },
];