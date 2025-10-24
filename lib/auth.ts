import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  developerId?: string;
}

export function generateToken(payload: TokenPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
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

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * NEW: Get current developer ID from request
 * Checks token and resolves developer record
 */
export async function getCurrentDeveloperId(req: NextRequest): Promise<string | null> {
  // First try to get from token payload
  const tokenPayload = getUserFromRequest(req);
  if (!tokenPayload) return null;

  // If developerId is in token, return it
  if (tokenPayload.developerId) {
    return tokenPayload.developerId;
  }

  // Otherwise, look up developer by userId
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
 * NEW: Require authentication middleware helper
 */
export async function requireAuth(req: NextRequest) {
  const tokenPayload = getUserFromRequest(req);
  if (!tokenPayload) {
    throw new Error('Unauthorized: No valid token found');
  }
  return tokenPayload;
}

/**
 * NEW: Require developer authentication
 */
export async function requireDeveloper(req: NextRequest) {
  const tokenPayload = await requireAuth(req);
  const developerId = await getCurrentDeveloperId(req);
  
  if (!developerId) {
    throw new Error('Unauthorized: Developer account required');
  }
  
  return { tokenPayload, developerId };
}