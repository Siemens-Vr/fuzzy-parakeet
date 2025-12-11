// app/api/user/reviews/route.ts
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

// GET - Get user's reviews
export async function GET(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reviews = await prisma.userReview.findMany({
      where: { userId: tokenPayload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        app: {
          select: {
            id: true,
            slug: true,
            name: true,
            iconUrl: true,
          }
        }
      }
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      helpful: review.helpful,
      verified: review.verified,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      app: {
        id: review.app.id,
        slug: review.app.slug,
        name: review.app.name,
        icon: review.app.iconUrl,
      }
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
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
    const { appSlug, rating, title, content } = body;

    // Validate input
    if (!appSlug) {
      return NextResponse.json(
        { error: 'App slug is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Find the app
    const app = await prisma.app.findUnique({
      where: { slug: appSlug },
      select: { id: true, status: true }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if user has purchased the app (for verified review status)
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: tokenPayload.userId,
          appId: app.id,
        }
      }
    });

    const isVerified = purchase?.status === 'COMPLETED';

    // Check if user already reviewed this app
    const existingReview = await prisma.userReview.findUnique({
      where: {
        appId_userId: {
          appId: app.id,
          userId: tokenPayload.userId,
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this app. Use PUT to update your review.' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.userReview.create({
      data: {
        appId: app.id,
        userId: tokenPayload.userId,
        rating,
        title: title || null,
        content: content || null,
        verified: isVerified,
      }
    });

    // Update app's average rating and count
    await updateAppRating(app.id);

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        verified: review.verified,
        createdAt: review.createdAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing review
export async function PUT(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { appSlug, rating, title, content } = body;

    if (!appSlug) {
      return NextResponse.json(
        { error: 'App slug is required' },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
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

    // Find existing review
    const existingReview = await prisma.userReview.findUnique({
      where: {
        appId_userId: {
          appId: app.id,
          userId: tokenPayload.userId,
        }
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found. Use POST to create a new review.' },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await prisma.userReview.update({
      where: { id: existingReview.id },
      data: {
        rating: rating || existingReview.rating,
        title: title !== undefined ? title : existingReview.title,
        content: content !== undefined ? content : existingReview.content,
      }
    });

    // Update app's average rating
    await updateAppRating(app.id);

    return NextResponse.json({
      message: 'Review updated successfully',
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        content: updatedReview.content,
        verified: updatedReview.verified,
        updatedAt: updatedReview.updatedAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const appSlug = searchParams.get('appSlug');

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

    // Find and delete the review
    const existingReview = await prisma.userReview.findUnique({
      where: {
        appId_userId: {
          appId: app.id,
          userId: tokenPayload.userId,
        }
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await prisma.userReview.delete({
      where: { id: existingReview.id }
    });

    // Update app's average rating
    await updateAppRating(app.id);

    return NextResponse.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// Helper function to update app's average rating
async function updateAppRating(appId: string) {
  const stats = await prisma.userReview.aggregate({
    where: { appId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.app.update({
    where: { id: appId },
    data: {
      rating: stats._avg.rating || null,
      ratingCount: stats._count.rating
    }
  });
}