// Types for app submission form

export interface AppFormData {
  // Step 1: Basic Info
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  
  // Step 2: Pricing & Distribution
  price: number;
  currency: string;
  salePrice: number | null;
  saleEndDate: string | null;
  
  // Step 3: Technical Requirements
  version: string;
  minApiLevel: number;
  targetDevices: string[];
  permissions: string[];
  sizeBytes: number;
  requiresHandTracking: boolean;
  requiresPassthrough: boolean;
  requiresControllers: boolean;
  
  // Step 4: Media & Assets
  apkFile: File | null;
  iconFile: File | null;
  screenshots: File[];
  heroImageFile: File | null;
  trailerUrl: string;
  promoVideoUrl: string;
  
  // Step 5: Content & Comfort
  contentRating: string;
  comfortLevel: string;
  playArea: string;
  playerModes: string[];
  estimatedPlayTime: string;
  ageRating: string;
  containsAds: boolean;
  hasInAppPurchases: boolean;
  inAppPurchaseInfo: string;
  
  // Step 6: Details & Features
  features: string[];
  whatsNew: string;
  languages: string[];
  
  // Step 7: Support & Links
  privacyPolicyUrl: string;
  supportUrl: string;
  supportEmail: string;
  discordUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  
  // Step 8: Additional Info
  developerNotes: string;
  credits: string;
  acknowledgments: string;
}

export interface FormStep {
  id: number;
  title: string;
  description: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface CategoryOption {
  value: string;
  label: string;
  subcategories: string[];
}

export interface DeviceOption {
  value: string;
  label: string;
}

export interface PermissionOption {
  value: string;
  label: string;
  description: string;
}

export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}