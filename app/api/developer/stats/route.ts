import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const { developerId } = await requireDeveloper(req);

        const apps = await prisma.app.findMany({
            where: { developerId },
            select: {
                downloads: true,
                revenue: true,
                rating: true,
                viewCount: true,
                status: true,
            },
        });

        const stats = {
            totalApps: apps.length,
            totalDownloads: apps.reduce((sum, app) => sum + (app.downloads || 0), 0),
            totalRevenue: apps.reduce((sum, app) => sum + (app.revenue || 0), 0),
            activeUsers: Math.floor(apps.reduce((sum, app) => sum + (app.downloads || 0), 0) * 0.4), // Mocked for now
            avgRating: apps.length > 0
                ? apps.reduce((sum, app) => sum + (app.rating || 0), 0) / apps.length
                : 0,
            pendingReviews: apps.filter(app => app.status === 'IN_REVIEW').length,
            monthlyGrowth: 15, // Mocked
            totalViews: apps.reduce((sum, app) => sum + (app.viewCount || 0), 0),
        };

        return NextResponse.json(stats);
    } catch (error: any) {
        console.error('GET /api/developer/stats error:', error);
        return NextResponse.json(
            { message: error?.message || 'Failed to fetch stats' },
            { status: error?.message?.includes('Unauthorized') ? 401 : 500 },
        );
    }
}
