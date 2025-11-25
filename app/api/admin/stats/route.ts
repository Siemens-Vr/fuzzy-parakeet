import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { AppStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [
      totalApps,
      pendingReview,
      published,
      rejected,
      totalDevelopers,
      totalRevenue,
      recentReviews
    ] = await Promise.all([
      prisma.app.count(),
      prisma.app.count({ where: { status: AppStatus.IN_REVIEW } }),
      prisma.app.count({ where: { status: AppStatus.PUBLISHED } }),
      prisma.app.count({ where: { status: AppStatus.SUSPENDED } }),
      prisma.developer.count(),
      prisma.app.aggregate({
        _sum: { revenue: true }
      }),
      prisma.appReview.count({
        where: {
          reviewedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return NextResponse.json({
      totalApps,
      pendingReview,
      published,
      rejected,
      totalDevelopers,
      totalRevenue: totalRevenue._sum.revenue || 0,
      recentReviews,
      reviewRate: totalApps > 0 ? ((published / totalApps) * 100).toFixed(1) : 0
    });

  } catch (error: any) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}