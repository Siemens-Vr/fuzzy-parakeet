// types/payments.ts

export type PaymentProvider = 'FLUTTERWAVE' | 'STRIPE';
export type PaymentMethod = 'MPESA' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'ZAR' | 'UGX' | 'TZS' | 'RWF';

export interface PaymentConfig {
  platformFeePercent: number; // Our cut (e.g., 30%)
  developerSharePercent: number; // Developer's share (e.g., 70%)
  minimumPayoutAmount: Record<Currency, number>;
  supportedCurrencies: Currency[];
}

export interface CheckoutSession {
  id: string;
  appId: string;
  userId: string;
  amount: number;
  currency: Currency;
  platformFee: number;
  developerAmount: number;
  provider: PaymentProvider;
  paymentMethod?: PaymentMethod;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  providerSessionId?: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface FlutterwavePaymentRequest {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options?: string;
  meta: {
    appId: string;
    userId: string;
    platformFee: number;
    developerAmount: number;
  };
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  subaccounts?: Array<{
    id: string;
    transaction_charge_type: 'flat' | 'percentage';
    transaction_charge: number;
  }>;
}

export interface FlutterwaveWebhookPayload {
  event: 'charge.completed' | 'transfer.completed';
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: 'successful' | 'failed' | 'pending';
    payment_type: string;
    created_at: string;
    account_id: number;
    meta: {
      appId: string;
      userId: string;
      platformFee: number;
      developerAmount: number;
    };
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
  };
}

export interface StripeCheckoutRequest {
  appId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface DeveloperPayout {
  id: string;
  developerId: string;
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  bankDetails?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  mobileMoneyDetails?: {
    phoneNumber: string;
    network: string;
  };
  stripeAccountId?: string;
  providerTransactionId?: string;
  periodStart: Date;
  periodEnd: Date;
  processedAt?: Date;
  createdAt: Date;
}

// Enhanced App submission types
export interface EnhancedAppDetails {
  // Basic Info
  name: string;
  slug: string;
  version: string;
  summary: string; // Short description (max 80 chars)
  description: string; // Full description with markdown support
  
  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  contentRating: 'EVERYONE' | 'TEEN' | 'MATURE' | 'ADULT_ONLY';
  
  // Pricing
  price: number;
  currency: Currency;
  salePrice?: number;
  saleEndDate?: Date;
  
  // Media
  iconUrl: string;
  heroImageUrl?: string;
  trailerUrl?: string;
  screenshots: string[];
  
  // Technical
  sizeBytes: bigint;
  minApiLevel: number;
  targetDevices: string[];
  permissions: string[];
  apkUrl: string;
  
  // Enhanced Details (SideQuest-like)
  features: string[]; // Key features list
  whatsNew: string; // Release notes / changelog
  languages: string[]; // Supported languages
  privacyPolicyUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
  discordUrl?: string;
  
  // Hardware Requirements
  requiresHandTracking: boolean;
  requiresPassthrough: boolean;
  comfortLevel: 'COMFORTABLE' | 'MODERATE' | 'INTENSE';
  playArea: 'SEATED' | 'STANDING' | 'ROOMSCALE';
  playerModes: ('SINGLE_PLAYER' | 'MULTIPLAYER' | 'CO_OP')[];
  
  // Additional Info
  estimatedPlayTime?: string;
  ageRating?: string;
  containsAds: boolean;
  hasInAppPurchases: boolean;
  
  // Developer Info
  developerNotes?: string;
  credits?: string;
  acknowledgments?: string;
}
