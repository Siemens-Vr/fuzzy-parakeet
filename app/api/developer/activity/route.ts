import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);

    // Get recent apps with their activity
    const recentApps = await prisma.app.findMany({
      where: { developerId },
      orderBy: { lastUpdated: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        lastUpdated: true,
        downloads: true,
      },
    });

    // Generate activity feed
    const activities = recentApps.flatMap((app: { status: string; id: any; name: any; lastUpdated: { toISOString: () => any; }; downloads: number; }, index: number) => {
      const activities = [];
      
      // Status changes
      if (app.status === 'PUBLISHED') {
        activities.push({
          id: `${app.id}-published`,
          type: 'update',
          message: `${app.name} was published to the store`,
          timestamp: app.lastUpdated.toISOString(),
          appName: app.name,
        });
      } else if (app.status === 'IN_REVIEW') {
        activities.push({
          id: `${app.id}-review`,
          type: 'review',
          message: `${app.name} is under review`,
          timestamp: app.lastUpdated.toISOString(),
          appName: app.name,
        });
      }

      // Download milestones
      if (app.downloads && app.downloads > 0) {
        if (app.downloads >= 1000) {
          activities.push({
            id: `${app.id}-downloads-1k`,
            type: 'download',
            message: `${app.name} reached ${app.downloads.toLocaleString()} downloads`,
            timestamp: new Date(Date.now() - index * 86400000).toISOString(),
            appName: app.name,
          });
        }
      }

      return activities;
    });

    // Sort by timestamp and return most recent
    const sortedActivities = activities
      .sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json(sortedActivities);
  } catch (error: any) {
    console.error('GET /api/developer/activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}