import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'downloads';

    // Build where clause
    const where: any = {
      // status: 'PUBLISHED',
    };

    if (category && category !== 'All apps') {
      where.category = category.toUpperCase().replace(/ /g, '_');
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'downloads':
      default:
        orderBy = { downloads: 'desc' };
    }

    const apps = await prisma.app.findMany({
      where,
      orderBy,
      select: {
        id: true,
        slug: true,
        name: true,
        version: true,
        summary: true,
        description: true,
        iconUrl: true,
        screenshots: true,
        category: true,
        rating: true,
        downloads: true,
        sizeBytes: true,
        lastUpdated: true,
        publishedAt: true,
        developer: {
          select: {
            organizationName: true,
          }
        }
      },
    });

    console.log(apps)

    // Format response
   const formattedApps = apps.map(app => ({
    slug: app.slug,
    name: app.name,
    version: app.version,
    summary: app.summary,
    description: app.description,
    icon: app.iconUrl,
    screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
    developer: app.developer?.organizationName ?? 'Unknown developer',
    category: app.category,
    rating: app.rating || 0,
    downloads: app.downloads,
    sizeBytes: Number(app.sizeBytes),
    lastUpdated: app.lastUpdated ? app.lastUpdated.toISOString() : null,
    releaseDate: app.publishedAt ? app.publishedAt.toISOString() : null,
  }));

    return NextResponse.json(formattedApps, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

