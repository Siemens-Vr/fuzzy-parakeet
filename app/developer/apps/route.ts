import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppStatus, Category, ReleaseChannel } from '@/prisma/generated/enums';
import type { Prisma } from '@/prisma/generated/client';

/** Resolve current developerId from headers or session (stub for your auth) */
async function getCurrentDeveloperId(req: NextRequest) {
  // Option A: pass X-Developer-Id from your client during dev
  const devId = req.headers.get('x-developer-id');
  if (devId) return devId;

  // Option B: if you have a user session, resolve Developer by userId
  const userId = req.headers.get('x-user-id');
  if (userId) {
    const dev = await prisma.developer.findUnique({ where: { userId } });
    return dev?.id || null;
  }
  return null;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function saveFile(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();

  const id = crypto.randomBytes(8).toString('hex');
  const rel = `/uploads/${folder}/${id}.${ext}`;
  const dirAbs = path.join(process.cwd(), 'public', 'uploads', folder);
  const abs = path.join(process.cwd(), 'public', rel);

  await fs.mkdir(dirAbs, { recursive: true });
  await fs.writeFile(abs, buf);

  return rel; // public URL path
}

/** GET: list current developer's apps for dashboard */
export async function GET(req: NextRequest) {
  const developerId = await getCurrentDeveloperId(req);
  if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    },
  });

  const rows = apps.map((a: { id: any; name: any; status: any; downloads: any; revenue: any; rating: any; lastUpdated: { toISOString: () => any; }; }) => ({
    id: a.id,
    name: a.name,
    status: a.status,                        // AppStatus enum string
    downloads: a.downloads ?? 0,
    revenue: a.revenue ?? 0,
    rating: a.rating ?? 0,
    lastUpdated: a.lastUpdated.toISOString(),
  }));

  return NextResponse.json(rows);
}

/** POST: create App + first AppBuild from multi-part form */
export async function POST(req: NextRequest) {
  const developerId = await getCurrentDeveloperId(req);
  if (!developerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.formData();

  // ---- Required core fields (per your model)
  const name = String(data.get('name') || '').trim();
  const version = String(data.get('version') || '').trim(); // REQUIRED by your schema
  const summary = String(data.get('summary') || '').trim();
  const description = String(data.get('description') || '').trim();
  const categoryStr = String(data.get('category') || '').trim().toUpperCase();
  const price = parseFloat(String(data.get('price') || '0')) || 0;

  // Validate category enum
  const validCategories = Object.values(Category);
  if (!validCategories.includes(categoryStr as Category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  if (!name || !version || !summary || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ---- Optional / technical JSON fields
  const minApiLevel = parseInt(String(data.get('minApiLevel') || '29'), 10);
  const targetDevices = (() => {
    try { return JSON.parse(String(data.get('targetDevices') || '[]')); }
    catch { return []; }
  })();
  const permissions = (() => {
    try { return JSON.parse(String(data.get('permissions') || '[]')); }
    catch { return []; }
  })();

  // ---- Files (APK required for initial build; icon/screens mandatory for store polish)
  const apk = data.get('apk') as File | null;
  const icon = data.get('icon') as File | null;
  const hero = data.get('heroImage') as File | null;
  const trailer = data.get('trailer') as File | null;

  const screenshots: File[] = [];
  for (const [k, v] of data.entries()) {
    if (k.startsWith('screenshot_') && v instanceof File) screenshots.push(v);
  }

  if (!apk) {
    return NextResponse.json({ error: 'APK is required' }, { status: 400 });
  }
  if (!icon) {
    return NextResponse.json({ error: 'Icon is required' }, { status: 400 });
  }
  if (screenshots.length < 3) {
    return NextResponse.json({ error: 'At least 3 screenshots are required' }, { status: 400 });
  }

  // ---- Save files
  const apkUrl = await saveFile(apk, 'apks');
  const iconUrl = await saveFile(icon, 'icons');
  const heroImageUrl = hero ? await saveFile(hero, 'hero') : null;
  const trailerUrl = trailer ? await saveFile(trailer, 'trailers') : null;
  const screenshotUrls = await Promise.all(screenshots.slice(0, 10).map(f => saveFile(f, 'screens')));

  // ---- Size (BigInt) + hash (optional)
  const sizeBytes = BigInt((apk as any).size || 0);
  // If you want SHA-256 of the APK:
  // const apkBuf = Buffer.from(await apk.arrayBuffer());
  // const sha256 = crypto.createHash('sha256').update(apkBuf).digest('hex');

  // ---- Create App + first Build in a transaction
  const app = await prisma.$transaction(async (tx: {
      app: {
        create: (arg0: {
          data: {
            slug: string; name: string; developerId: any; version: string; // keep in App as per your schema
            description: string; summary: string; category: Category; price: number;
            // Files on App (optional but nice for store listing)
            apkUrl: string; // you may keep main APK here too
            iconUrl: string; screenshots: Prisma.JsonArray; heroImageUrl: string | null; trailerUrl: string | null;
            // Technical
            sizeBytes: bigint;
            // sha256,                // uncomment if computed above
            minApiLevel: number; targetDevices: Prisma.JsonArray; permissions: Prisma.JsonArray;
            // Status
            status: "IN_REVIEW";
          };
        }) => any;
      }; appBuild: { create: (arg0: { data: { appId: any; version: string; buildNumber: number; apkUrl: string; channel: "ALPHA"; isActive: boolean; releaseNotes: string; }; }) => any; };
    }) => {
    const createdApp = await tx.app.create({
      data: {
        slug: slugify(name),
        name,
        developerId,
        version,                 // keep in App as per your schema
        description,
        summary,
        category: categoryStr as Category,
        price,
        // Files on App (optional but nice for store listing)
        apkUrl,                  // you may keep main APK here too
        iconUrl,
        screenshots: screenshotUrls as unknown as Prisma.JsonArray,
        heroImageUrl,
        trailerUrl,
        // Technical
        sizeBytes,
        // sha256,                // uncomment if computed above
        minApiLevel,
        targetDevices: targetDevices as unknown as Prisma.JsonArray,
        permissions: permissions as unknown as Prisma.JsonArray,
        // Status
        status: AppStatus.IN_REVIEW,
      },
    });

    await tx.appBuild.create({
      data: {
        appId: createdApp.id,
        version,
        buildNumber: 1,
        apkUrl,
        channel: ReleaseChannel.ALPHA,
        isActive: true,
        releaseNotes: String(data.get('releaseNotes') || ''),
      },
    });

    return createdApp;
  });

  return NextResponse.json({ id: app.id });
}
