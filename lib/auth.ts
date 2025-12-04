import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import crypto from 'crypto';

const JWT_SECRET: Secret =
  process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  developerId?: string;
}

export function generateToken(
  payload: TokenPayload,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// For email verification tokens (not JWT)
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get current developer ID from request
 */
export async function getCurrentDeveloperId(
  req: NextRequest
): Promise<string | null> {
  const tokenPayload = getUserFromRequest(req);
  if (!tokenPayload) return null;

  if (tokenPayload.developerId) {
    return tokenPayload.developerId;
  }

  try {
    const developer = await prisma.developer.findUnique({
      where: { userId: tokenPayload.userId },
      select: { id: true }
    });
    return developer?.id || null;
  } catch (error) {
    console.error('Error fetching developer:', error);
    return null;
  }
}

/**
 * Require authentication middleware helper
 */
export async function requireAuth(req: NextRequest) {
  const tokenPayload = getUserFromRequest(req);
  if (!tokenPayload) {
    throw new Error('Unauthorized: No valid token found');
  }
  return tokenPayload;
}

/**
 * Require developer authentication
 */
export async function requireDeveloper(req: NextRequest) {
  const tokenPayload = await requireAuth(req);
  const developerId = await getCurrentDeveloperId(req);

  if (!developerId) {
    throw new Error('Unauthorized: Developer account required');
  }

  return { tokenPayload, developerId };
}

export function getAdminFromRequest(
  request: NextRequest
): TokenPayload | null {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(req: NextRequest) {
  const tokenPayload = getAdminFromRequest(req);

  if (!tokenPayload || tokenPayload.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  const reviewer = await prisma.reviewer.findUnique({
    where: { userId: tokenPayload.userId },
    select: { id: true }
  });

  return {
    tokenPayload,
    reviewerId: reviewer?.id || ''
  };
}
