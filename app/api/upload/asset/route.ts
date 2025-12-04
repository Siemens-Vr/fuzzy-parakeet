import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZES = {
  apk: 1024 * 1024 * 1024, // 1GB
  icon: 5 * 1024 * 1024, // 5MB
  screenshot: 10 * 1024 * 1024, // 10MB
  hero: 10 * 1024 * 1024, // 10MB
  trailer: 100 * 1024 * 1024, // 100MB
};

const ALLOWED_MIME_TYPES = {
  apk: ['application/vnd.android.package-archive'],
  icon: ['image/png', 'image/jpeg', 'image/jpg'],
  screenshot: ['image/png', 'image/jpeg', 'image/jpg'],
  hero: ['image/png', 'image/jpeg', 'image/jpg'],
  trailer: ['video/mp4'],
};

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

  return rel;
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    await requireDeveloper(req);

    const data = await req.formData();
    const file = data.get('file') as File | null;
    const type = String(data.get('type') || 'screenshot');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['apk', 'icon', 'screenshot', 'hero', 'trailer'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[type as keyof typeof MAX_FILE_SIZES];
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB` },
        { status: 400 }
      );
    }

    // Validate MIME type (except for APK which might have generic application/octet-stream)
    if (type !== 'apk') {
      const allowedMimes = ALLOWED_MIME_TYPES[type as keyof typeof ALLOWED_MIME_TYPES];
      if (!allowedMimes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file format. Allowed: ${allowedMimes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Determine folder
    const folderMap: Record<string, string> = {
      apk: 'apks',
      icon: 'icons',
      screenshot: 'screens',
      hero: 'hero',
      trailer: 'trailers',
    };

    const folder = folderMap[type] || 'misc';
    
    console.log(`Uploading ${type} file: ${file.name} (${file.size} bytes)`);
    const url = await saveFile(file, folder);
    console.log(`File saved to: ${url}`);

    return NextResponse.json({
      url,
      filename: file.name,
      size: file.size,
      type,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };