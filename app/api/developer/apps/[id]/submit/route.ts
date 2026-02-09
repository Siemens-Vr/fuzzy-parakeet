import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';
import { AppStatus, SubmissionStatus } from '@/prisma/generated/enums';

export const dynamic = 'force-dynamic';

/** POST: Submit app draft/release for review */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { developerId } = await requireDeveloper(req);
        const { id } = await params;

        const body = await req.json().catch(() => ({}));
        const { releaseId, includeDraft = true } = body;

        // Verify app ownership
        const app = await prisma.app.findUnique({
            where: { id },
            select: { id: true, developerId: true, status: true }
        });

        if (!app) {
            return NextResponse.json({ message: 'App not found' }, { status: 404 });
        }

        if (app.developerId !== developerId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Check for pending submissions
        const pendingSubmission = await prisma.submission.findFirst({
            where: {
                appId: id,
                status: {
                    in: [SubmissionStatus.PENDING, SubmissionStatus.IN_REVIEW]
                }
            }
        });

        if (pendingSubmission) {
            return NextResponse.json({
                message: 'A submission is already in progress',
                submissionId: pendingSubmission.id
            }, { status: 409 });
        }

        // Create submission
        const submission = await prisma.$transaction(async tx => {
            const sub = await tx.submission.create({
                data: {
                    appId: id,
                    targetReleaseId: releaseId || null,
                    includeDraft: includeDraft,
                    status: SubmissionStatus.PENDING,
                }
            });

            // Update App status to indicate it's under review
            // (Only if not already PUBLISHED? Or always?)
            // If published, we might keep it PUBLISHED but show "Update Pending" in dashboard.
            // If DRAFT, move to IN_REVIEW.
            if (app.status === AppStatus.DRAFT || app.status === AppStatus.CHANGES_REQUESTED) {
                await tx.app.update({
                    where: { id },
                    data: { status: AppStatus.IN_REVIEW }
                });
            }

            return sub;
        });

        return NextResponse.json({
            message: 'Submission created successfully',
            submission
        }, { status: 201 });

    } catch (error: any) {
        console.error('POST /api/developer/apps/[id]/submit error:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to submit app' },
            { status: 500 }
        );
    }
}
