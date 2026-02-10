import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Simple fetch, sorted by newest
        const articles = await prisma.article.findMany({
            take: limit,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                excerpt: true,
                coverImageUrl: true,
                category: true,
                authorName: true,
                publishedAt: true,
                readTime: true,
            }
        });

        return NextResponse.json(articles);
    } catch (error) {
        console.error('Failed to fetch articles:', error);
        return NextResponse.json(
            { message: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
}
