// Types for app details page

export interface AppDetails {
  id: string;
  slug: string;
  name: string;
  version: string;
  summary: string;
  description: string;
  
  // Developer
  developer: {
    id: string;
    organizationName: string;
    isVerified: boolean;
  };
  
  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  contentRating: 'EVERYONE' | 'TEEN' | 'MATURE' | 'ADULT_ONLY';
  
  // Pricing
  price: number;
  currency: string;
  salePrice?: number;
  saleEndDate?: string;
  
  // Media
  iconUrl?: string;
  screenshots: string[];
  heroImageUrl?: string;
  trailerUrl?: string;
  promoVideoUrl?: string;
  
  // Technical
  sizeBytes: number;
  minApiLevel: number;
  targetDevices: string[];
  permissions: string[];
  
  // Enhanced Details
  features: string[];
  whatsNew?: string;
  languages: string[];
  privacyPolicyUrl?: string;
  supportUrl?: string;
  supportEmail?: string;
  discordUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  
  // Hardware Requirements
  requiresHandTracking: boolean;
  requiresPassthrough: boolean;
  requiresControllers: boolean;
  comfortLevel: 'COMFORTABLE' | 'MODERATE' | 'INTENSE';
  playArea: 'SEATED' | 'STANDING' | 'ROOMSCALE';
  playerModes: string[];
  
  // Additional Info
  estimatedPlayTime?: string;
  ageRating?: string;
  containsAds: boolean;
  hasInAppPurchases: boolean;
  inAppPurchaseInfo?: string;
  
  // Developer Notes
  credits?: string;
  acknowledgments?: string;
  
  // Status & Dates
  status: string;
  publishedAt?: string;
  lastUpdated: string;
  createdAt: string;
  
  // Metrics
  rating?: number;
  ratingCount: number;
  downloads: number;
  viewCount: number;
  wishlistCount: number;
}

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content?: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
}

export interface RelatedApp {
  id: string;
  slug: string;
  name: string;
  iconUrl?: string;
  price: number;
  currency: string;
  rating?: number;
  ratingCount: number;
}