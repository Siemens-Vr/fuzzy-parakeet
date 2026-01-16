export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';
import { AppStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);

    const [totalApps, sums, avg, pending] = await Promise.all([
      prisma.app.count({ where: { developerId } }),
      prisma.app.aggregate({
        where: { developerId },
        _sum: { downloads: true, revenue: true },
      }),
      prisma.app.aggregate({
        where: { developerId, rating: { not: null } },
        _avg: { rating: true },
      }),
      prisma.app.count({ where: { developerId, status: AppStatus.IN_REVIEW } }),
    ]);

    return NextResponse.json({
      totalApps,
      totalDownloads: sums._sum.downloads ?? 0,
      totalRevenue: sums._sum.revenue ?? 0,
      activeUsers: Math.max(0, Math.round((sums._sum.downloads ?? 0) * 0.42)), // placeholder KPI
      avgRating: avg._avg.rating ?? 0,
      pendingReviews: pending,
      monthlyGrowth: 12, // Mock data - implement real calculation
      totalViews: Math.round((sums._sum.downloads ?? 0) * 3.5), // Mock data
    });
  } catch (error: any) {
    console.error('GET /api/developer/stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}