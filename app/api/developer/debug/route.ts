import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const auth = await requireDeveloper(req);
        const developer = await prisma.developer.findUnique({
            where: { id: auth.developerId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        const apps = await prisma.app.findMany({
            where: { developerId: auth.developerId }
        });

        return NextResponse.json({
            auth,
            developer,
            appsCount: apps.length,
            apps
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
