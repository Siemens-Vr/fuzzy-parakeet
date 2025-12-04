import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';



function serializeBigInt(data: any): any {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);
    
    const app = await prisma.app.findUnique({
      where: { id: params.id },
      include: {
        developer: {
          include: {
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
        },
        builds: {
          orderBy: { uploadedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBigInt(app));

  } catch (error: any) {
    console.error('GET /api/admin/apps/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch app' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}