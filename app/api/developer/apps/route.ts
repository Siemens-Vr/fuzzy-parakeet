import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentDeveloperId, requireDeveloper } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppStatus, Category, ReleaseChannel, Prisma } from '@prisma/client';

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

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('GET /api/developer/apps error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/** POST: create App + first AppBuild from multi-part form */
export async function POST(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);

    const data = await req.formData();

    // ---- Required core fields (per your model)
    const name = String(data.get('name') || '').trim();
    const version = String(data.get('version') || '').trim();
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
      return NextResponse.json({ error: 'Missing required fields: name, version, summary, description' }, { status: 400 });
    }

    // ---- Optional / technical JSON fields
    const minApiLevel = parseInt(String(data.get('minApiLevel') || '29'), 10);
    
    let targetDevices: string[] = [];
    try {
      const td = data.get('targetDevices');
      if (td) targetDevices = JSON.parse(String(td));
    } catch {}

    let permissions: string[] = [];
    try {
      const p = data.get('permissions');
      if (p) permissions = JSON.parse(String(p));
    } catch {}

    // ---- Files (APK required for initial build; icon/screens mandatory for store polish)
    const apk = data.get('apk') as File | null;
    const icon = data.get('icon') as File | null;
    const hero = data.get('heroImage') as File | null;
    const trailer = data.get('trailer') as File | null;

    const screenshots: File[] = [];
    for (const [k, v] of data.entries()) {
      if (k.startsWith('screenshot_') && v instanceof File) {
        screenshots.push(v);
      }
    }

    if (!apk) {
      return NextResponse.json({ error: 'APK file is required' }, { status: 400 });
    }
    if (!icon) {
      return NextResponse.json({ error: 'Icon is required' }, { status: 400 });
    }
    if (screenshots.length < 3) {
      return NextResponse.json({ error: 'At least 3 screenshots are required' }, { status: 400 });
    }

    // ---- Save files
    console.log('Saving APK file...');
    const apkUrl = await saveFile(apk, 'apks');
    
    console.log('Saving icon file...');
    const iconUrl = await saveFile(icon, 'icons');
    
    const heroImageUrl = hero ? await saveFile(hero, 'hero') : null;
    const trailerUrl = trailer ? await saveFile(trailer, 'trailers') : null;
    
    console.log('Saving screenshots...');
    const screenshotUrls = await Promise.all(
      screenshots.slice(0, 10).map(f => saveFile(f, 'screens'))
    );

    // ---- Size (BigInt)
    const sizeBytes = BigInt((apk as any).size || 0);

    // ---- Create App + first Build in a transaction
    console.log('Creating app in database...');
    const app = await prisma.$transaction(async (tx) => {
      const createdApp = await tx.app.create({
        data: {
          slug: slugify(name),
          name,
          developerId,
          version,
          description,
          summary,
          category: categoryStr as Category,
          price,
          // Files on App
          apkUrl,
          iconUrl,
          screenshots: screenshotUrls as unknown as Prisma.JsonArray,
          heroImageUrl,
          trailerUrl,
          // Technical
          sizeBytes,
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

    console.log('App created successfully:', app.id);

    return NextResponse.json({ 
      id: app.id,
      message: 'App submitted successfully',
      status: 'IN_REVIEW'
    });

  } catch (error: any) {
    console.error('POST /api/developer/apps error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create app' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}