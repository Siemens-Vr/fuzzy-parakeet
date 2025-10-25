// app/api/download/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';

// Configuration
const ENABLE_AUTH_CHECK = process.env.REQUIRE_AUTH_FOR_DOWNLOAD === 'true' || true;
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';
const MAX_DOWNLOADS_PER_MINUTE = parseInt(process.env.MAX_DOWNLOADS_PER_MINUTE || '10');

// Local file storage path
const LOCAL_APKS_DIR = join(process.cwd(), 'public', 'uploads', 'apks');

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Check authentication if enabled
    if (ENABLE_AUTH_CHECK) {
      const token = req.cookies.get('user_token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required. Please sign in to download apps.' },
          { status: 401 }
        );
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET!);
      } catch {
        return NextResponse.json(
          { error: 'Invalid or expired session. Please sign in again.' },
          { status: 401 }
        );
      }
    }

    // Find the app in database
    const app = await prisma.app.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        apkUrl: true,
        downloads: true,
      },
    });

    if (!app || !app.apkUrl) {
      return NextResponse.json(
        { error: 'App not found or APK not available' },
        { status: 404 }
      );
    }

    // Rate limiting check
    if (ENABLE_RATE_LIMIT) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      if (!checkRateLimit(ip, MAX_DOWNLOADS_PER_MINUTE)) {
        return NextResponse.json(
          { error: 'Too many download requests. Please try again later.' },
          { 
            status: 429,
            headers: { 'Retry-After': '60' },
          }
        );
      }
    }

    const filename = app.apkUrl.split('/').pop() || `${slug}.apk`;
    
    // Try to serve from local uploads directory
    const localFilePath = join(LOCAL_APKS_DIR, filename);
    
    console.log(`📥 Looking for APK: ${localFilePath}`);
    
    let fileStats;
    try {
      fileStats = await stat(localFilePath);
    } catch (error) {
      console.log(`❌ Local file not found: ${localFilePath}`);
      return NextResponse.json(
        { error: 'APK file not found on server' },
        { status: 404 }
      );
    }

    // Support for resumable downloads (Range header)
    const range = req.headers.get('range');
    
    // Prepare response headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-App-Name': encodeURIComponent(app.name),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, X-App-Name',
      'Content-Length': fileStats.size.toString(),
      'Accept-Ranges': 'bytes',
    };

    // Handle range requests for resumable downloads
    if (range) {
      const bytes = range.replace(/bytes=/, "").split("-");
      const start = parseInt(bytes[0], 10);
      const end = bytes[1] ? parseInt(bytes[1], 10) : fileStats.size - 1;
      const chunksize = (end - start) + 1;

      headers['Content-Range'] = `bytes ${start}-${end}/${fileStats.size}`;
      headers['Content-Length'] = chunksize.toString();

      console.log(`📊 Serving range: ${start}-${end} (${chunksize} bytes)`);

      const stream = createReadStream(localFilePath, { start, end });
      
      // Track download (async, don't wait)
      trackDownload(app.id, slug).catch(console.error);

      return new Response(stream as any, {
        status: 206,
        headers,
      });
    }

    // Full file request
    console.log(`✅ Streaming APK: ${app.name} (${fileStats.size} bytes)`);

    const stream = createReadStream(localFilePath);
    
    // Track download (async, don't wait)
    trackDownload(app.id, slug).catch(console.error);

    return new Response(stream as any, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    return NextResponse.json(
      { error: 'Download failed. Please try again later.' },
      { status: 500 }
    );
  }
}

// Track download count
async function trackDownload(appId: string, slug: string) {
  try {
    // Increment download count
    await prisma.app.update({
      where: { id: appId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });
    
    console.log(`✅ Updated download count for ${slug}`);
  } catch (error) {
    console.error('Failed to track download:', error);
  }
}

// Rate limiting
const downloadCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxDownloads = 10, windowMs = 60000): boolean {
  // Skip rate limiting for localhost
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
    return true;
  }

  const now = Date.now();
  const record = downloadCounts.get(ip);

  if (!record || now > record.resetTime) {
    downloadCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxDownloads) {
    return false;
  }

  record.count++;
  return true;
}

// CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}