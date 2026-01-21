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
      where: { slug },
      include: {
        developer: true,
      },
    });

    // console.log(app)

    // Not found or not published → 404
    if (!app || app.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Helpers to coerce Json fields into arrays
    const asArray = (value: any): any[] =>
      Array.isArray(value) ? value : [];

    const tags = asArray(app.tags);
    const screenshots = asArray(app.screenshots);
    const targetDevices = asArray(app.targetDevices);
    const permissions = asArray(app.permissions);
    const features = asArray(app.features);
    const languages = asArray(app.languages);
    const playerModes = asArray(app.playerModes);

    const formattedApp = {
      id: app.id,
      slug: app.slug,
      name: app.name,
      version: app.version,
      summary: app.summary,
      description: app.description,

      developer: {
        id: app.developer.id,
        organizationName: app.developer.organizationName,
        isVerified: app.developer.isVerified,
      },

      // Categorisation
      category: app.category,
      subcategory: app.subcategory ?? null,
      tags,

      contentRating: app.contentRating,       // e.g. 'EVERYONE'
      price: app.price,
      currency: app.currency,
      salePrice: app.salePrice ?? null,
      saleEndDate: app.saleEndDate
        ? app.saleEndDate.toISOString()
        : null,

      // Media
      iconUrl: app.iconUrl,
      screenshots,
      heroImageUrl: app.heroImageUrl,
      trailerUrl: app.trailerUrl,
      promoVideoUrl: app.promoVideoUrl,

      // Technical
      sizeBytes: Number(app.sizeBytes),       // BigInt → number
      minApiLevel: app.minApiLevel,
      targetDevices,
      permissions,

      // Enhanced details
      features,
      whatsNew: app.whatsNew ?? null,
      languages,
      privacyPolicyUrl: app.privacyPolicyUrl ?? null,
      supportUrl: app.supportUrl ?? null,
      supportEmail: app.supportEmail ?? null,
      discordUrl: app.discordUrl ?? null,
      twitterUrl: app.twitterUrl ?? null,
      youtubeUrl: app.youtubeUrl ?? null,

      // Hardware / comfort
      requiresHandTracking: app.requiresHandTracking,
      requiresPassthrough: app.requiresPassthrough,
      requiresControllers: app.requiresControllers,
      comfortLevel: app.comfortLevel,        // 'COMFORTABLE' | 'MODERATE' | 'INTENSE'
      playArea: app.playArea,                // 'SEATED' | 'STANDING' | 'ROOMSCALE'
      playerModes,

      // Extra info
      estimatedPlayTime: app.estimatedPlayTime ?? null,
      ageRating: app.ageRating ?? null,
      containsAds: app.containsAds,
      hasInAppPurchases: app.hasInAppPurchases,
      inAppPurchaseInfo: app.inAppPurchaseInfo ?? null,
      credits: app.credits ?? null,
      acknowledgments: app.acknowledgments ?? null,

      // Status & dates
      status: app.status,
      publishedAt: app.publishedAt
        ? app.publishedAt.toISOString()
        : null,
      lastUpdated: app.lastUpdated.toISOString(),
      createdAt: app.createdAt.toISOString(),

      // Metrics
      rating: app.rating ?? 0,
      ratingCount: app.ratingCount ?? 0,
      downloads: app.downloads ?? 0,
      viewCount: app.viewCount ?? 0,
      wishlistCount: app.wishlistCount ?? 0,
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
