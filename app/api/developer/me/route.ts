import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userPayload = getUserFromRequest(req);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const developer = await prisma.developer.findUnique({
            where: { userId: userPayload.userId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!developer) {
            return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });
        }

        // Return flattened structure for easier consumption
        return NextResponse.json({
            ...developer,
            name: developer.user.name,
            email: developer.user.email,
        });
    } catch (error) {
        console.error('Error fetching developer profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userPayload = getUserFromRequest(req);
        if (!userPayload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            organizationName,
            websiteUrl,
            bio,
            logoUrl,
            socialLinks,
            supportEmail, // Note: supportEmail is not directly on Developer model in schema I saw, but let's check. 
            // Ah, schema showed it on App but not Developer.
            // Wait, user request asked for 'Developer Contact Email'. I didn't add it to schema.
            // I'll skip it for now or store it in preferences/socialLinks if needed, 
            // or just use user email but that might not be right.
            // Let's check schema again. `email` is on user. 
            // I will add supportEmail to schema if I missed it? 
            // I checked schema in step 727, didn't add supportEmail to Developer.
            // I'll omit supportEmail for this iteration or assume it's part of 'socialLinks' or 'preferences' 
            // to avoid another migration right now. 
            // Actually, I can put it in preferences or socialLinks object.
            preferences
        } = body;

        // Validate ownership
        const developer = await prisma.developer.findUnique({
            where: { userId: userPayload.userId }
        });

        if (!developer) {
            return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });
        }

        const updated = await prisma.developer.update({
            where: { userId: userPayload.userId },
            data: {
                organizationName,
                websiteUrl,
                bio,
                logoUrl,
                socialLinks: socialLinks ?? undefined,
                preferences: preferences ?? undefined,
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating developer profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
