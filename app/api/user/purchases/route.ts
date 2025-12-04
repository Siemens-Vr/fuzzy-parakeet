import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

// GET - Get user's purchased apps
export async function GET(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: tokenPayload.userId,
        status: 'COMPLETED',
      },
      include: {
        app: {
          select: {
            id: true,
            slug: true,
            name: true,
            iconUrl: true,
            version: true,
            category: true,
            developer: {
              select: {
                organizationName: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const library = purchases.map((p: { id: any; completedAt: any; totalAmount: any; app: { slug: any; name: any; iconUrl: any; version: any; category: any; developer: { organizationName: any; }; }; }) => ({
      purchaseId: p.id,
      purchasedAt: p.completedAt,
      amountPaid: Number(p.totalAmount),
      app: {
        slug: p.app.slug,
        name: p.app.name,
        icon: p.app.iconUrl,
        version: p.app.version,
        category: p.app.category,
        developer: p.app.developer.organizationName,
      },
    }));

    return NextResponse.json({
      purchases: library,
      totalSpent: purchases.reduce(
        (sum: number, p: { totalAmount: any; }) => sum + Number(p.totalAmount),
        0
      ),
    });
  } catch (error: any) {
    console.error('Get purchases error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get purchases' },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const tokenPayload = getUserFromToken(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { appSlug } = body;

    if (!appSlug) {
      return NextResponse.json(
        { error: 'App slug required' },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: appSlug },
      select: { id: true, price: true },
    });

    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Free apps are always "owned"
    if (Number(app.price) === 0) {
      return NextResponse.json({
        owned: true,
        free: true,
      });
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: tokenPayload.userId,
          appId: app.id,
        },
      },
      select: {
        status: true,
        completedAt: true,
      },
    });

    return NextResponse.json({
      owned: purchase?.status === 'COMPLETED',
      free: false,
      purchasedAt: purchase?.completedAt,
    });
  } catch (error: any) {
    console.error('Check ownership error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check ownership' },
      { status: 500 }
    );
  }
}