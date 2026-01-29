import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppStatus, Category, ContentRating, ComfortLevel, PlayArea } from '@/prisma/generated/enums';
import type { Prisma } from '@/prisma/generated/client';

export const dynamic = 'force-dynamic';

async function saveFile(file: File, folder: string) {
    const bytes = await file.arrayBuffer();
    const buf = new Uint8Array(bytes);
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();

    const id = crypto.randomBytes(8).toString('hex');
    const rel = `/uploads/${folder}/${id}.${ext}`;
    const dirAbs = path.join(process.cwd(), 'public', 'uploads', folder);
    const abs = path.join(process.cwd(), 'public', rel);

    await fs.mkdir(dirAbs, { recursive: true });
    await fs.writeFile(abs, buf);

    return rel;
}

function parseJsonArray(value: FormDataEntryValue | null): any[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(String(value));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function parseBool(value: FormDataEntryValue | null, defaultValue = false) {
    if (value == null) return defaultValue;
    const v = String(value).toLowerCase();
    return v === 'true' || v === '1' || v === 'on' || v === 'yes';
}

/** GET: Fetch single app for editing */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { developerId } = await requireDeveloper(req);
        const { id } = await params;

        const app = await prisma.app.findUnique({
            where: { id },
            include: {
                developer: {
                    select: {
                        id: true,
                        organizationName: true,
                    }
                },
                builds: {
                    orderBy: { uploadedAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        version: true,
                        buildNumber: true,
                        channel: true,
                        isActive: true,
                        uploadedAt: true,
                    }
                }
            }
        });

        if (!app) {
            return NextResponse.json(
                { message: 'App not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (app.developerId !== developerId) {
            return NextResponse.json(
                { message: 'You do not have permission to edit this app' },
                { status: 403 }
            );
        }

        // Transform for frontend consumption
        const appData = {
            id: app.id,
            slug: app.slug,
            name: app.name,
            summary: app.summary,
            description: app.description,
            category: app.category,
            subcategory: app.subcategory,
            tags: app.tags || [],

            // Pricing
            price: app.price,
            currency: app.currency,
            salePrice: app.salePrice,
            saleEndDate: app.saleEndDate?.toISOString() || null,

            // Technical
            version: app.version,
            minApiLevel: app.minApiLevel,
            targetApiLevel: app.targetApiLevel,
            targetDevices: app.targetDevices || [],
            permissions: app.permissions || [],
            sizeBytes: app.sizeBytes ? Number(app.sizeBytes) : 0,
            requiresHandTracking: app.requiresHandTracking,
            requiresPassthrough: app.requiresPassthrough,
            requiresControllers: app.requiresControllers,

            // Media
            apkUrl: app.apkUrl,
            iconUrl: app.iconUrl,
            screenshots: app.screenshots || [],
            heroImageUrl: app.heroImageUrl,
            trailerUrl: app.trailerUrl,
            promoVideoUrl: app.promoVideoUrl,

            // Content
            contentRating: app.contentRating,
            comfortLevel: app.comfortLevel,
            playArea: app.playArea,
            playerModes: app.playerModes || [],
            estimatedPlayTime: app.estimatedPlayTime,
            ageRating: app.ageRating,
            containsAds: app.containsAds,
            hasInAppPurchases: app.hasInAppPurchases,
            inAppPurchaseInfo: app.inAppPurchaseInfo,

            // Features
            features: app.features || [],
            whatsNew: app.whatsNew,
            languages: app.languages || [],

            // Support
            privacyPolicyUrl: app.privacyPolicyUrl,
            supportUrl: app.supportUrl,
            supportEmail: app.supportEmail,
            discordUrl: app.discordUrl,
            twitterUrl: app.twitterUrl,
            youtubeUrl: app.youtubeUrl,

            // Additional
            developerNotes: app.developerNotes,
            credits: app.credits,
            acknowledgments: app.acknowledgments,

            // Meta
            status: app.status,
            downloads: app.downloads,
            revenue: app.revenue,
            rating: app.rating,
            reviewCount: app.ratingCount,
            createdAt: app.createdAt.toISOString(),
            lastUpdated: app.lastUpdated.toISOString(),

            // Related
            developer: app.developer,
            recentBuilds: app.builds,
        };

        return NextResponse.json(appData);
    } catch (error: any) {
        console.error('GET /api/developer/apps/[id] error:', error);
        return NextResponse.json(
            { message: error?.message || 'Failed to fetch app' },
            { status: error?.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}

/** PATCH: Update app metadata */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { developerId } = await requireDeveloper(req);
        const { id } = await params;

        // Verify app exists and developer owns it
        const existingApp = await prisma.app.findUnique({
            where: { id },
            select: { id: true, developerId: true, status: true }
        });

        if (!existingApp) {
            return NextResponse.json(
                { message: 'App not found' },
                { status: 404 }
            );
        }

        if (existingApp.developerId !== developerId) {
            return NextResponse.json(
                { message: 'You do not have permission to edit this app' },
                { status: 403 }
            );
        }

        const contentType = req.headers.get('content-type') || '';
        let updateData: Prisma.AppUpdateInput = {};

        if (contentType.includes('multipart/form-data')) {
            // Handle form data with file uploads
            const data = await req.formData();

            // Text fields
            const textFields: (keyof Prisma.AppUpdateInput)[] = [
                'name', 'slug', 'summary', 'description', 'subcategory',
                'whatsNew', 'privacyPolicyUrl', 'supportUrl', 'supportEmail',
                'discordUrl', 'twitterUrl', 'youtubeUrl', 'trailerUrl', 'promoVideoUrl',
                'estimatedPlayTime', 'ageRating', 'inAppPurchaseInfo',
                'developerNotes', 'credits', 'acknowledgments', 'currency'
            ];

            for (const field of textFields) {
                const value = data.get(field as string);
                if (value !== null) {
                    (updateData as any)[field] = String(value).trim() || null;
                }
            }

            // Category (enum)
            const categoryStr = data.get('category');
            if (categoryStr) {
                const cat = String(categoryStr).toUpperCase();
                if (Object.values(Category).includes(cat as Category)) {
                    updateData.category = cat as Category;
                }
            }

            // Numeric fields
            const price = data.get('price');
            if (price !== null) updateData.price = parseFloat(String(price)) || 0;

            const salePrice = data.get('salePrice');
            if (salePrice !== null) {
                const sp = String(salePrice).trim();
                updateData.salePrice = sp ? parseFloat(sp) : null;
            }

            const minApiLevel = data.get('minApiLevel');
            if (minApiLevel !== null) updateData.minApiLevel = parseInt(String(minApiLevel), 10) || 29;

            // Boolean fields
            updateData.requiresHandTracking = parseBool(data.get('requiresHandTracking'));
            updateData.requiresPassthrough = parseBool(data.get('requiresPassthrough'));
            updateData.requiresControllers = parseBool(data.get('requiresControllers'));
            updateData.containsAds = parseBool(data.get('containsAds'));
            updateData.hasInAppPurchases = parseBool(data.get('hasInAppPurchases'));

            // Array fields
            const arrayFields = ['tags', 'targetDevices', 'permissions', 'playerModes', 'features', 'languages'];
            for (const field of arrayFields) {
                const value = data.get(field);
                if (value !== null) {
                    (updateData as any)[field] = parseJsonArray(value);
                }
            }

            // Enum fields
            const contentRating = data.get('contentRating');
            if (contentRating) {
                const cr = String(contentRating).toUpperCase();
                if (Object.values(ContentRating).includes(cr as ContentRating)) {
                    updateData.contentRating = cr as ContentRating;
                }
            }

            const comfortLevel = data.get('comfortLevel');
            if (comfortLevel) {
                const cl = String(comfortLevel).toUpperCase();
                if (Object.values(ComfortLevel).includes(cl as ComfortLevel)) {
                    updateData.comfortLevel = cl as ComfortLevel;
                }
            }

            const playArea = data.get('playArea');
            if (playArea) {
                const pa = String(playArea).toUpperCase();
                if (Object.values(PlayArea).includes(pa as PlayArea)) {
                    updateData.playArea = pa as PlayArea;
                }
            }

            // File uploads
            const iconFile = data.get('iconFile') as File | null;
            if (iconFile && iconFile.size > 0) {
                updateData.iconUrl = await saveFile(iconFile, 'icons');
            }

            const heroImageFile = data.get('heroImageFile') as File | null;
            if (heroImageFile && heroImageFile.size > 0) {
                updateData.heroImageUrl = await saveFile(heroImageFile, 'hero');
            }

            // Screenshots
            const newScreenshots: string[] = [];
            for (const [key, value] of data.entries()) {
                if (key.startsWith('screenshot_') && value instanceof File && value.size > 0) {
                    const url = await saveFile(value, 'screens');
                    newScreenshots.push(url);
                }
            }

            // If new screenshots uploaded, merge with existing or replace
            const existingScreenshots = data.get('existingScreenshots');
            if (existingScreenshots || newScreenshots.length > 0) {
                const existing = parseJsonArray(existingScreenshots);
                updateData.screenshots = [...existing, ...newScreenshots].slice(0, 10);
            }

        } else {
            // Handle JSON body (simpler metadata updates)
            const body = await req.json();

            // Copy allowed fields
            const allowedFields = [
                'name', 'slug', 'summary', 'description', 'subcategory',
                'price', 'currency', 'salePrice',
                'minApiLevel', 'targetDevices', 'permissions',
                'requiresHandTracking', 'requiresPassthrough', 'requiresControllers',
                'contentRating', 'comfortLevel', 'playArea', 'playerModes',
                'containsAds', 'hasInAppPurchases', 'inAppPurchaseInfo',
                'features', 'whatsNew', 'languages', 'tags',
                'privacyPolicyUrl', 'supportUrl', 'supportEmail',
                'discordUrl', 'twitterUrl', 'youtubeUrl',
                'trailerUrl', 'promoVideoUrl',
                'estimatedPlayTime', 'ageRating',
                'developerNotes', 'credits', 'acknowledgments'
            ];

            for (const field of allowedFields) {
                if (body[field] !== undefined) {
                    (updateData as any)[field] = body[field];
                }
            }

            // Handle category enum
            if (body.category) {
                const cat = String(body.category).toUpperCase();
                if (Object.values(Category).includes(cat as Category)) {
                    updateData.category = cat as Category;
                }
            }
        }

        // Update lastUpdated
        updateData.lastUpdated = new Date();

        // Determine if status should change based on current status
        // If app is PUBLISHED and significant changes are made, it may need re-review
        // For now, we'll keep status unchanged for metadata updates
        // Build updates (new APK) are handled separately

        const updatedApp = await prisma.app.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                status: true,
                lastUpdated: true,
            }
        });

        return NextResponse.json({
            message: 'App updated successfully',
            app: updatedApp
        });

    } catch (error: any) {
        console.error('PATCH /api/developer/apps/[id] error:', error);
        return NextResponse.json(
            { message: error?.message || 'Failed to update app' },
            { status: error?.message?.includes('Unauthorized') ? 401 : 500 }
        );
    }
}
