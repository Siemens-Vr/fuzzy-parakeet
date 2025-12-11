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

// POST - Mark a review as helpful
export async function POST(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reviewId } = params;

    // Find the review
    const review = await prisma.userReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Prevent users from marking their own review as helpful
    if (review.userId === tokenPayload.userId) {
      return NextResponse.json(
        { error: 'You cannot mark your own review as helpful' },
        { status: 400 }
      );
    }

    // Increment helpful count
    // Note: In a production app, you'd want to track which users marked which reviews
    // to prevent multiple votes. This is a simplified version.
    const updatedReview = await prisma.userReview.update({
      where: { id: reviewId },
      data: {
        helpful: { increment: 1 }
      }
    });

    return NextResponse.json({
      message: 'Review marked as helpful',
      helpful: updatedReview.helpful
    });

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}