// app/api/user/reviews/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

// POST - Check if user has reviewed an app
export async function POST(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { appSlug } = body;

    if (!appSlug) {
      return NextResponse.json(
        { error: 'App slug is required' },
        { status: 400 }
      );
    }

    // Find the app
    const app = await prisma.app.findUnique({
      where: { slug: appSlug },
      select: { id: true }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user has reviewed this app
    const existingReview = await prisma.userReview.findUnique({
      where: {
        appId_userId: {
          appId: app.id,
          userId: tokenPayload.userId,
        }
      }
    });

    // Check if user has purchased the app
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: tokenPayload.userId,
          appId: app.id,
        }
      }
    });

    const hasPurchased = purchase?.status === 'COMPLETED';

    if (existingReview) {
      return NextResponse.json({
        hasReviewed: true,
        hasPurchased,
        review: {
          id: existingReview.id,
          rating: existingReview.rating,
          title: existingReview.title,
          content: existingReview.content,
          verified: existingReview.verified,
          createdAt: existingReview.createdAt.toISOString(),
          updatedAt: existingReview.updatedAt.toISOString(),
        }
      });
    }

    return NextResponse.json({
      hasReviewed: false,
      hasPurchased,
      review: null
    });

  } catch (error) {
    console.error('Error checking review:', error);
    return NextResponse.json(
      { error: 'Failed to check review status' },
      { status: 500 }
    );
  }
}