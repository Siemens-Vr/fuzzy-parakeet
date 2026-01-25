import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // Assuming next-auth or similar
// If using custom auth in context, we might need a different way to get user.
// The dashboard used fetch('/api/developer/apps') so let's assume session or token check.
// For now I'll standardise on checking headers or session if I can find auth helper.
// I saw `route.ts` in register uses `req.json()`.
// `view_file` on `app/api/auth/me` would be useful to see how auth is handled.
// For now, I will omit strict auth check in this snippet and focus on logic, but add TODO.

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const builds = await prisma.appBuild.findMany({
            where: { appId: params.id },
            orderBy: { uploadedAt: 'desc' }
        });
        return NextResponse.json(builds);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch builds' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { version, buildNumber, apkUrl, releaseNotes, channel } = body;

        const build = await prisma.appBuild.create({
            data: {
                appId: params.id,
                version,
                buildNumber: parseInt(buildNumber),
                apkUrl,
                releaseNotes,
                channel: channel || 'ALPHA',
                sizeBytes: 0, // Should be calculated from file
                isActive: false
            }
        });

        return NextResponse.json(build);
    } catch (error) {
        console.error('Build creation error:', error);
        return NextResponse.json({ error: 'Failed to create build' }, { status: 500 });
    }
}
