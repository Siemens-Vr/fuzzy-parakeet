// lib/utils.ts
import crypto from 'crypto';

// Simple random verification token (64 hex characters)
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// (Optional) other helpers you might have:
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function absoluteUrl(path = '/') {
  if (typeof window !== 'undefined') {
    const origin = window?.location.origin ?? '';
    return new URL(path, origin).toString();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return new URL(path, baseUrl).toString();
}
