import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { developer: { organizationName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const apps = await prisma.app.findMany({
      where,
      include: {
        developer: {
          select: {
            id: true,
            organizationName: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 1,
          include: {
            reviewer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(apps);
  } catch (error: any) {
    console.error('GET /api/admin/apps error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}