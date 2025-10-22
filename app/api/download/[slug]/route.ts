import apps from '@/data/apps.json';
import type { NextRequest } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';

// Configuration
const USE_STREAMING = process.env.USE_STREAMING === 'true' || true;
const ENABLE_RATE_LIMIT = process.env.ENABLE_RATE_LIMIT === 'true';
const MAX_DOWNLOADS_PER_MINUTE = parseInt(process.env.MAX_DOWNLOADS_PER_MINUTE || '10');

// Local file storage path
const LOCAL_APKS_DIR = join(process.cwd(), 'public', 'apks');

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const app = (apps as any[]).find((a) => a.slug === slug);
  
  if (!app) {
    return new Response('App not found', { status: 404 });
  }

  // Rate limiting check
  if (ENABLE_RATE_LIMIT) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip, MAX_DOWNLOADS_PER_MINUTE)) {
      return new Response('Too many download requests. Please try again later.', { 
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      });
    }
  }

  const base = process.env.DL_BASE_URL?.replace(/\/$/, '') || '';
  const filename = app.filename || `${app.slug}.apk`;

  // Check if client wants streaming (for sideloading)
  const userAgent = req.headers.get('user-agent') || '';
  const isSideloading = req.headers.get('x-sideload') === 'true' || 
                       userAgent.includes('APK-Downloader') ||
                       USE_STREAMING;

  // Mode 1: Redirect to external URL (if DL_BASE_URL is set)
  if (base && !isSideloading) {
    const target = `${base}/${encodeURIComponent(filename)}`;
    
    // Track download
    if (process.env.TRACK_DOWNLOADS === 'true') {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      trackDownload(slug, ip || undefined).catch(console.error);
    }

    return new Response(null, {
      status: 302,
      headers: { 
        'Location': target, 
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Mode 2: Stream local file (fallback when no DL_BASE_URL or for sideloading)
  try {
    // Try to serve from local public/apks directory first
    const localFilePath = join(LOCAL_APKS_DIR, filename);
    
    console.log(`📥 Looking for local APK: ${localFilePath}`);
    
    let fileStats;
    try {
      fileStats = await stat(localFilePath);
    } catch (error) {
      console.log(`❌ Local file not found: ${localFilePath}`);
      
      // If we have a base URL and local file doesn't exist, proxy from external URL
      if (base) {
        const target = `${base}/${encodeURIComponent(filename)}`;
        console.log(`🔄 Proxying from external URL: ${target}`);
        return await proxyFromExternal(target, app, req);
      } else {
        return new Response('APK file not found locally and no external URL configured', { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    }

    // Support for resumable downloads (Range header)
    const range = req.headers.get('range');
    
    // Prepare response headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-App-Name': encodeURIComponent(app.name),
      'X-App-Version': app.version || '1.0.0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, X-App-Name, X-App-Version',
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
      
      // Track download
      if (process.env.TRACK_DOWNLOADS === 'true') {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
        trackDownload(slug, ip || undefined).catch(console.error);
      }

      return new Response(stream as any, {
        status: 206,
        headers,
      });
    }

    // Full file request
    console.log(`✅ Streaming local APK: ${app.name} (${fileStats.size} bytes)`);

    const fileBuffer = await readFile(localFilePath);
    
    // Track download
    if (process.env.TRACK_DOWNLOADS === 'true') {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
      trackDownload(slug, ip || undefined).catch(console.error);
    }

    return new Response(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Download error:', error);
    return new Response('Download failed. Please try again later.', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Proxy from external URL when local file doesn't exist
async function proxyFromExternal(target: string, app: any, req: NextRequest) {
  try {
    // Support for resumable downloads (Range header)
    const range = req.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; APK-Downloader/1.0)',
    };
    
    if (range) {
      fetchHeaders['Range'] = range;
    }

    console.log(`🔄 Fetching from: ${target}`);
    
    const fileResponse = await fetch(target, {
      method: 'GET',
      headers: fetchHeaders,
    });

    if (!fileResponse.ok && fileResponse.status !== 206) {
      console.error(`❌ Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
      return new Response('File not found or unavailable', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Get content length and range info
    const contentLength = fileResponse.headers.get('content-length');
    const contentRange = fileResponse.headers.get('content-range');
    const acceptRanges = fileResponse.headers.get('accept-ranges');
    
    // Prepare response headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${app.filename}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-App-Name': encodeURIComponent(app.name),
      'X-App-Version': app.version || '1.0.0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, X-App-Name, X-App-Version',
    };

    // Add content length if available
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Add range headers for resumable downloads
    if (acceptRanges) {
      headers['Accept-Ranges'] = acceptRanges;
    }
    if (contentRange) {
      headers['Content-Range'] = contentRange;
    }

    // Return appropriate status code (206 for partial content, 200 for full)
    const status = range && fileResponse.status === 206 ? 206 : 200;

    console.log(`✅ Proxying APK: ${app.name} (${contentLength} bytes)`);

    return new Response(fileResponse.body, {
      status,
      headers,
    });
  } catch (error) {
    console.error('❌ Proxy download error:', error);
    throw error;
  }
}

// Optional: Add download tracking
async function trackDownload(slug: string, ip?: string) {
  console.log(`📊 Download tracked: ${slug} from ${ip || 'unknown'}`);
  
  // Simple in-memory tracking (replace with database in production)
  try {
    // Example: Update download count in apps.json
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const appsPath = path.join(process.cwd(), 'data', 'apps.json');
    const appsData = JSON.parse(await fs.readFile(appsPath, 'utf-8'));
    
    const appIndex = appsData.findIndex((a: any) => a.slug === slug);
    if (appIndex !== -1) {
      appsData[appIndex].downloads = (appsData[appIndex].downloads || 0) + 1;
      await fs.writeFile(appsPath, JSON.stringify(appsData, null, 2));
      console.log(`✅ Updated download count for ${slug}`);
    }
  } catch (error) {
    console.log('Note: Download tracking file update failed (expected in production)');
  }
}

// Optional: Add rate limiting
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

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, X-Sideload, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}