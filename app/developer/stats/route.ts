import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppStatus } from '@prisma/client';

async function getCurrentDeveloperId(req: NextRequest) {
  const devId = req.headers.get('x-developer-id');
  if (devId) return devId;
  const userId = req.headers.get('x-user-id');
  if (userId) {
    const dev = await prisma.developer.findUnique({ where: { userId } });
    return dev?.id || null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const developerId = await getCurrentDeveloperId(req);
  if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  });
}
