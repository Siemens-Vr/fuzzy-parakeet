// app/api/developer/apps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  AppStatus,
  Category,
  ReleaseChannelKey,
  ContentRating,
  ComfortLevel,
  PlayArea,
} from '@/prisma/generated/enums';

import type { Prisma } from '@/prisma/generated/client';



export const dynamic = 'force-dynamic';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function saveFile(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buf = new Uint8Array(bytes);
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();

  const id = crypto.randomBytes(8).toString('hex');
  const rel = `/uploads/${folder}/${id}.${ext}`;
  const dirAbs = path.join(process.cwd(), 'public', 'uploads', folder);
  const abs = path.join(process.cwd(), 'public', rel);

  await fs.mkdir(dirAbs, { recursive: true });
  await fs.writeFile(abs, buf);

  return rel;
}

function parseJsonArray(value: FormDataEntryValue | null): any[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseBool(value: FormDataEntryValue | null, defaultValue = false) {
  if (value == null) return defaultValue;
  const v = String(value).toLowerCase();
  return v === 'true' || v === '1' || v === 'on' || v === 'yes';
}

/** GET: current developer's apps (dashboard) */
export async function GET(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);

    const apps = await prisma.app.findMany({
      where: { developerId },
      orderBy: { lastUpdated: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        downloads: true,
        revenue: true,
        rating: true,
        lastUpdated: true,
        version: true,
        iconUrl: true,
      },
    });

    const rows = apps.map(a => ({
      id: a.id,
      name: a.name,
      status: a.status,
      downloads: a.downloads ?? 0,
      revenue: a.revenue ?? 0,
      rating: a.rating ?? 0,
      lastUpdated: a.lastUpdated.toISOString(),
      version: a.version,
      iconUrl: a.iconUrl,
    }));
    console.log(rows)
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/developer/apps error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch apps' },
      { status: error?.message?.includes('Unauthorized') ? 401 : 500 },
    );
  }
}

/** POST: create App + first Artifact/Release from multi-part form */
export async function POST(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);
    const data = await req.formData();

    // ---- Required basics
    const name = String(data.get('name') || '').trim();
    const version = String(data.get('version') || '').trim();
    const summary = String(data.get('summary') || '').trim();
    const description = String(data.get('description') || '').trim();
    const categoryStr = String(data.get('category') || '').trim().toUpperCase();

    if (!name || !version || !summary || !description) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: name, version, summary, description',
        },
        { status: 400 },
      );
    }

    const validCategories = Object.values(Category);
    if (!validCategories.includes(categoryStr as Category)) {
      return NextResponse.json(
        { message: 'Invalid category' },
        { status: 400 },
      );
    }

    // Pricing
    const price = parseFloat(String(data.get('price') || '0')) || 0;
    const salePriceRaw = data.get('salePrice');
    const salePrice =
      salePriceRaw && String(salePriceRaw).trim() !== ''
        ? parseFloat(String(salePriceRaw))
        : null;
    const saleEndDateRaw = data.get('saleEndDate');
    const saleEndDate =
      saleEndDateRaw && String(saleEndDateRaw).trim() !== ''
        ? new Date(String(saleEndDateRaw))
        : null;
    const currency = String(data.get('currency') || 'USD').toUpperCase();

    // Optional categorisation
    const subcategory = String(data.get('subcategory') || '').trim() || null;

    // Arrays
    const tags = parseJsonArray(data.get('tags'));
    const targetDevices = parseJsonArray(data.get('targetDevices'));
    const playerModes = parseJsonArray(data.get('playerModes'));
    const languages = parseJsonArray(data.get('languages'));
    const features = parseJsonArray(data.get('features'));
    const permissions = parseJsonArray(data.get('permissions'));

    // Text fields
    const whatsNew = String(data.get('whatsNew') || '').trim() || null;
    const privacyPolicyUrl =
      String(data.get('privacyPolicyUrl') || '').trim() || null;
    const supportUrl = String(data.get('supportUrl') || '').trim() || null;
    const supportEmail =
      String(data.get('supportEmail') || '').trim() || null;
    const discordUrl = String(data.get('discordUrl') || '').trim() || null;
    const twitterUrl = String(data.get('twitterUrl') || '').trim() || null;
    const youtubeUrl = String(data.get('youtubeUrl') || '').trim() || null;
    const estimatedPlayTime =
      String(data.get('estimatedPlayTime') || '').trim() || null;
    const ageRating = String(data.get('ageRating') || '').trim() || null;
    const inAppPurchaseInfo =
      String(data.get('inAppPurchaseInfo') || '').trim() || null;
    const developerNotes =
      String(data.get('developerNotes') || '').trim() || null;
    const credits = String(data.get('credits') || '').trim() || null;
    const acknowledgments =
      String(data.get('acknowledgments') || '').trim() || null;

    const trailerUrl = String(data.get('trailerUrl') || '').trim() || null;
    const promoVideoUrl = String(data.get('promoVideoUrl') || '').trim() || null;

    // Booleans
    const requiresHandTracking = parseBool(
      data.get('requiresHandTracking'),
      false,
    );
    const requiresPassthrough = parseBool(
      data.get('requiresPassthrough'),
      false,
    );
    const requiresControllers = parseBool(
      data.get('requiresControllers'),
      true,
    );
    const containsAds = parseBool(data.get('containsAds'), false);
    const hasInAppPurchases = parseBool(
      data.get('hasInAppPurchases'),
      false,
    );

    // Technical
    const minApiLevel = parseInt(String(data.get('minApiLevel') || '29'), 10);
    const targetApiLevelRaw = data.get('targetApiLevel');
    const targetApiLevel =
      targetApiLevelRaw && String(targetApiLevelRaw).trim() !== ''
        ? parseInt(String(targetApiLevelRaw), 10)
        : null;

    // Enums
    const rawContentRating = String(
      data.get('contentRating') || ContentRating.EVERYONE,
    ).toUpperCase();
    const rawComfortLevel = String(
      data.get('comfortLevel') || ComfortLevel.COMFORTABLE,
    ).toUpperCase();
    const rawPlayArea = String(
      data.get('playArea') || PlayArea.STANDING,
    ).toUpperCase();

    const contentRating = Object.values(ContentRating).includes(
      rawContentRating as ContentRating,
    )
      ? (rawContentRating as ContentRating)
      : ContentRating.EVERYONE;

    const comfortLevel = Object.values(ComfortLevel).includes(
      rawComfortLevel as ComfortLevel,
    )
      ? (rawComfortLevel as ComfortLevel)
      : ComfortLevel.COMFORTABLE;

    let playArea: PlayArea;
    if (rawPlayArea === 'SEATED') {
      playArea = PlayArea.SEATED;
    } else if (
      rawPlayArea === 'ROOMSCALE' ||
      rawPlayArea === 'ROOM_SCALE' ||
      rawPlayArea === 'BOTH' ||
      rawPlayArea === 'STANDING_AND_ROOMSCALE'
    ) {
      playArea = PlayArea.ROOMSCALE;
    } else {
      playArea = PlayArea.STANDING;
    }

    // Files
    const apk = data.get('apkFile') as File | null;
    const icon = data.get('iconFile') as File | null;
    const heroImage = data.get('heroImageFile') as File | null;
    const trailerVideo = data.get('trailerVideoFile') as File | null;

    const screenshots: File[] = [];
    for (const [k, v] of data.entries()) {
      if (k.startsWith('screenshot_') && v instanceof File) {
        screenshots.push(v);
      }
    }

    if (!apk) {
      return NextResponse.json(
        { message: 'APK file is required' },
        { status: 400 },
      );
    }
    if (!icon) {
      return NextResponse.json(
        { message: 'Icon is required' },
        { status: 400 },
      );
    }
    if (screenshots.length < 3) {
      return NextResponse.json(
        { message: 'At least 3 screenshots are required' },
        { status: 400 },
      );
    }

    // Save files
    const apkUrl = await saveFile(apk, 'apks');
    const iconUrl = await saveFile(icon, 'icons');
    const heroImageUrl = heroImage ? await saveFile(heroImage, 'hero') : null;
    const screenshotUrls = await Promise.all(
      screenshots.slice(0, 10).map(file => saveFile(file, 'screens')),
    );
    const trailerVideoUrl = trailerVideo ? await saveFile(trailerVideo, 'trailers') : null;

    const sizeBytes = BigInt((apk as any).size || 0);
    const releaseNotes = String(data.get('releaseNotes') || '');

    // Transaction: Create App, Draft, Artifact, Channels, and Initial Release
    const app = await prisma.$transaction(async tx => {
      // 1. Create the App (Live/Production container)
      // Note: We populate it with the initial data so the dashboard works,
      // but status is IN_REVIEW.
      const createdApp = await tx.app.create({
        data: {
          slug: slugify(name),
          name,
          developerId,
          version,
          summary,
          description,
          category: categoryStr as Category,
          subcategory,
          tags: tags as unknown as Prisma.JsonArray,
          contentRating,
          price,
          currency,
          salePrice,
          saleEndDate,
          apkUrl,
          iconUrl,
          screenshots: screenshotUrls as unknown as Prisma.JsonArray,
          heroImageUrl,
          trailerUrl,
          trailerVideoUrl,
          promoVideoUrl,
          sizeBytes,
          minApiLevel,
          targetApiLevel,
          targetDevices: targetDevices as unknown as Prisma.JsonArray,
          permissions: permissions as unknown as Prisma.JsonArray,
          features: features as unknown as Prisma.JsonArray,
          whatsNew,
          languages: languages as unknown as Prisma.JsonArray,
          privacyPolicyUrl,
          supportUrl,
          supportEmail,
          discordUrl,
          twitterUrl,
          youtubeUrl,
          requiresHandTracking,
          requiresPassthrough,
          requiresControllers,
          comfortLevel,
          playArea,
          playerModes: playerModes as unknown as Prisma.JsonArray,
          estimatedPlayTime,
          ageRating,
          containsAds,
          hasInAppPurchases,
          inAppPurchaseInfo,
          developerNotes,
          credits,
          acknowledgments,
          status: AppStatus.IN_REVIEW,
        },
      });

      // 2. Create AppDraft (identical copy for editing)
      await tx.appDraft.create({
        data: {
          appId: createdApp.id,
          name,
          summary,
          description,
          category: categoryStr as Category,
          subcategory,
          tags: tags as unknown as Prisma.JsonArray,
          contentRating,
          price,
          currency,
          salePrice,
          saleEndDate,
          iconUrl,
          screenshots: screenshotUrls as unknown as Prisma.JsonArray,
          heroImageUrl,
          trailerUrl,
          trailerVideoUrl,
          promoVideoUrl,
          minApiLevel,
          targetApiLevel,
          targetDevices: targetDevices as unknown as Prisma.JsonArray,
          permissions: permissions as unknown as Prisma.JsonArray,
          features: features as unknown as Prisma.JsonArray,
          whatsNew,
          languages: languages as unknown as Prisma.JsonArray,
          privacyPolicyUrl,
          supportUrl,
          supportEmail,
          discordUrl,
          twitterUrl,
          youtubeUrl,
          estimatedPlayTime,
          ageRating,
          containsAds,
          hasInAppPurchases,
          inAppPurchaseInfo,
          developerNotes,
          credits,
          acknowledgments,
          requiresHandTracking,
          requiresPassthrough,
          requiresControllers,
          comfortLevel,
          playArea,
          playerModes: playerModes as unknown as Prisma.JsonArray,
        },
      });

      // 3. Create Artifact
      const artifact = await tx.artifact.create({
        data: {
          appId: createdApp.id,
          versionString: version,
          versionCode: 10001, // Simple starting version code or derived from input? Using placeholder
          fileUrl: apkUrl,
          fileSize: sizeBytes,
          minApiLevel,
        },
      });

      // 4. Create Release Channels
      const channels = [
        ReleaseChannelKey.PRODUCTION,
        ReleaseChannelKey.ALPHA,
        ReleaseChannelKey.BETA,
        ReleaseChannelKey.RC
      ];

      const createdChannels: Record<string, any> = {};

      for (const key of channels) {
        createdChannels[key] = await tx.releaseChannel.create({
          data: {
            appId: createdApp.id,
            key,
          },
        });
      }

      // 5. Create Release for ALPHA channel
      const release = await tx.release.create({
        data: {
          channelId: createdChannels[ReleaseChannelKey.ALPHA].id,
          artifactId: artifact.id,
          status: 'ACTIVE', // ReleaseStatus.ACTIVE
          rolloutPercentage: 100,
          releaseNotes,
        },
      });

      // 6. Set as current release for Alpha
      await tx.releaseChannel.update({
        where: { id: createdChannels[ReleaseChannelKey.ALPHA].id },
        data: { currentReleaseId: release.id },
      });

      return createdApp;
    });

    return NextResponse.json(
      {
        id: app.id,
        message: 'App submitted successfully',
        status: app.status,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/developer/apps error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to create app' },
      { status: error?.message?.includes('Unauthorized') ? 401 : 500 },
    );
  }
}
