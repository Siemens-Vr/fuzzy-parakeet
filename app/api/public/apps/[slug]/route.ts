
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const app = await prisma.app.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        slug: true,
        name: true,
        version: true,
        summary: true,
        description: true,
        iconUrl: true,
        screenshots: true,
        heroImageUrl: true,
        trailerUrl: true,
        category: true,
        rating: true,
        downloads: true,
        sizeBytes: true,
        minApiLevel: true,
        targetDevices: true,
        permissions: true,
        lastUpdated: true,
        publishedAt: true,
        apkUrl: true,
        developer: {
          select: {
            organizationName: true,
            websiteUrl: true,
          }
        }
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedApp = {
      slug: app.slug,
      name: app.name,
      version: app.version,
      summary: app.summary,
      description: app.description,
      icon: app.iconUrl,
      screenshots: Array.isArray(app.screenshots) ? app.screenshots : [],
      heroImage: app.heroImageUrl,
      trailer: app.trailerUrl,
      developer: app.developer.organizationName,
      developerWebsite: app.developer.websiteUrl,
      category: app.category,
      rating: app.rating || 0,
      downloads: app.downloads,
      sizeBytes: Number(app.sizeBytes),
      minApiLevel: app.minApiLevel,
      targetDevices: Array.isArray(app.targetDevices) ? app.targetDevices : [],
      permissions: Array.isArray(app.permissions) ? app.permissions : [],
      lastUpdated: app.lastUpdated.toISOString(),
      releaseDate: app.publishedAt?.toISOString(),
      apkFileName: app.apkUrl?.split('/').pop() || `${app.slug}.apk`,
    };

    return NextResponse.json(formattedApp, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Error fetching app:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app' },
      { status: 500 }
    );
  }
}