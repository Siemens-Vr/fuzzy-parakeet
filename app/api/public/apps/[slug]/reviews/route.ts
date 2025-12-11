// app/api/public/apps/[slug]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch reviews for an app
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest'; // 'newest', 'oldest', 'helpful', 'highest', 'lowest'
    
    // Find the app first
    const app = await prisma.app.findUnique({
      where: { slug },
      select: { id: true, status: true }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Build orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.userReview.count({
      where: { appId: app.id }
    });

    // Fetch reviews with pagination
    const reviews = await prisma.userReview.findMany({
      where: { appId: app.id },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        // We don't have a direct user relation in UserReview, so we'll fetch user separately
      }
    });

    // Fetch user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await prisma.user.findUnique({
          where: { id: review.userId },
          select: { id: true, name: true }
        });
        
        return {
          id: review.id,
          userId: review.userId,
          userName: user?.name || 'Anonymous User',
          rating: review.rating,
          title: review.title,
          content: review.content,
          helpful: review.helpful,
          verified: review.verified,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
        };
      })
    );

    // Calculate rating distribution
    const ratingDistribution = await prisma.userReview.groupBy({
      by: ['rating'],
      where: { appId: app.id },
      _count: { rating: true }
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.rating;
    });

    // Calculate average rating
    const avgRating = await prisma.userReview.aggregate({
      where: { appId: app.id },
      _avg: { rating: true }
    });

    return NextResponse.json({
      reviews: reviewsWithUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: totalCount,
        distribution
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}