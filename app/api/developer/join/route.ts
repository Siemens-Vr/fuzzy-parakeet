import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // Get the authenticated user
        const tokenPayload = getUserFromRequest(req);

        if (!tokenPayload) {
            return NextResponse.json(
                { message: 'Unauthorized: Please log in first' },
                { status: 401 }
            );
        }

        // Check if user already has a developer account
        const existingDeveloper = await prisma.developer.findUnique({
            where: { userId: tokenPayload.userId }
        });

        if (existingDeveloper) {
            return NextResponse.json(
                { message: 'You already have a developer account' },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { organizationName, websiteUrl } = body;

        if (!organizationName || typeof organizationName !== 'string' || !organizationName.trim()) {
            return NextResponse.json(
                { message: 'Organization name is required' },
                { status: 400 }
            );
        }

        // Create developer account
        const developer = await prisma.developer.create({
            data: {
                userId: tokenPayload.userId,
                organizationName: organizationName.trim(),
                websiteUrl: websiteUrl?.trim() || null,
                isVerified: false, // Developers start unverified
            },
            select: {
                id: true,
                organizationName: true,
                isVerified: true,
            }
        });

        // Update user role to DEVELOPER if it's currently USER
        await prisma.user.update({
            where: { id: tokenPayload.userId },
            data: { role: 'DEVELOPER' }
        });

        return NextResponse.json({
            message: 'Developer account created successfully',
            developer
        }, { status: 201 });

    } catch (error: any) {
        console.error('POST /api/developer/join error:', error);
        return NextResponse.json(
            { message: error?.message || 'Failed to create developer account' },
            { status: 500 }
        );
    }
}
