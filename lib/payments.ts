// lib/payments.ts

import { PaymentConfig, Currency, PaymentProvider } from '@/types/payments';

export const PAYMENT_CONFIG: PaymentConfig = {
  platformFeePercent: 30, // We take 30%
  developerSharePercent: 70, // Developer gets 70%
  minimumPayoutAmount: {
    KES: 1000, // 1000 KES minimum
    USD: 10,
    EUR: 10,
    GBP: 10,
    NGN: 5000,
    GHS: 100,
    ZAR: 200,
    UGX: 50000,
    TZS: 30000,
    RWF: 10000,
  },
  supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP', 'NGN', 'GHS', 'ZAR', 'UGX', 'TZS', 'RWF'],
};

// Flutterwave configuration
export const FLUTTERWAVE_CONFIG = {
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!,
  webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET!,
  baseUrl: 'https://api.flutterwave.com/v3',
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Currency to country mapping for Flutterwave
export const CURRENCY_COUNTRY_MAP: Record<Currency, string> = {
  KES: 'KE',
  USD: 'US',
  EUR: 'EU',
  GBP: 'GB',
  NGN: 'NG',
  GHS: 'GH',
  ZAR: 'ZA',
  UGX: 'UG',
  TZS: 'TZ',
  RWF: 'RW',
};

// Mobile money supported currencies
export const MOBILE_MONEY_CURRENCIES: Currency[] = ['KES', 'UGX', 'TZS', 'RWF', 'GHS'];

// Calculate platform fee and developer share
export function calculatePaymentSplit(amount: number): {
  platformFee: number;
  developerAmount: number;
} {
  const platformFee = Math.round((amount * PAYMENT_CONFIG.platformFeePercent) / 100 * 100) / 100;
  const developerAmount = Math.round((amount - platformFee) * 100) / 100;
  
  return {
    platformFee,
    developerAmount,
  };
}

// Generate unique transaction reference
export function generateTxRef(appId: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `VR-${appId.substring(0, 8)}-${userId.substring(0, 8)}-${timestamp}-${random}`;
}

// Determine best payment provider based on currency
export function getBestPaymentProvider(currency: Currency): PaymentProvider {
  // Use Flutterwave for African currencies, Stripe for international
  const flutterwaveCurrencies: Currency[] = ['KES', 'NGN', 'GHS', 'ZAR', 'UGX', 'TZS', 'RWF'];
  return flutterwaveCurrencies.includes(currency) ? 'FLUTTERWAVE' : 'STRIPE';
}

// Format currency for display
export function formatCurrency(amount: number, currency: Currency): string {
  const localeMap: Record<Currency, string> = {
    KES: 'en-KE',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    NGN: 'en-NG',
    GHS: 'en-GH',
    ZAR: 'en-ZA',
    UGX: 'en-UG',
    TZS: 'en-TZ',
    RWF: 'en-RW',
  };
  
  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
  }).format(amount);
}

// Validate phone number for M-Pesa
export function validateMpesaPhone(phone: string): { valid: boolean; formatted: string } {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('254')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Should be 9 digits starting with 7 or 1
  const valid = /^[71]\d{8}$/.test(cleaned);
  const formatted = valid ? `254${cleaned}` : '';
  
  return { valid, formatted };
}

// Get payment methods available for a currency
export function getPaymentMethods(currency: Currency): string[] {
  const methods: string[] = ['card'];
  
  if (currency === 'KES') {
    methods.unshift('mpesa'); // M-Pesa first for Kenya
    methods.push('bank_transfer');
  } else if (MOBILE_MONEY_CURRENCIES.includes(currency)) {
    methods.push('mobilemoney');
    methods.push('bank_transfer');
  } else {
    methods.push('bank_transfer');
  }
  
  return methods;
}

export type { Currency };
