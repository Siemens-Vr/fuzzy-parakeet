import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { AppStatus, ReviewStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reviewerId } = await requireAdmin(req);
    const { id } = params;
    const body = await req.json();
    
    const {
      status,
      technicalPass,
      contentPass,
      notes,
      vrcResults
    } = body;

    // Start transaction to update both review and app status
    const result = await prisma.$transaction(async (tx: { appReview: { create: (arg0: { data: { appId: string; reviewerId: any; status: ReviewStatus; technicalPass: any; contentPass: any; notes: any; vrcResults: any; }; }) => any; }; app: { update: (arg0: { where: { id: string; }; data: { status: "CHANGES_REQUESTED" | "IN_REVIEW" | "PUBLISHED" | "SUSPENDED"; publishedAt: Date | undefined; }; }) => any; }; }) => {
      // Create review record
      const review = await tx.appReview.create({
        data: {
          appId: id,
          reviewerId,
          status: status as ReviewStatus,
          technicalPass,
          contentPass,
          notes,
          vrcResults: vrcResults || null
        }
      });

      // Update app status based on review
      let appStatus: AppStatus;
      if (status === 'APPROVED') {
        appStatus = AppStatus.PUBLISHED;
      } else if (status === 'REJECTED') {
        appStatus = AppStatus.SUSPENDED;
      } else if (status === 'CHANGES_REQUESTED') {
        appStatus = AppStatus.CHANGES_REQUESTED;
      } else {
        appStatus = AppStatus.IN_REVIEW;
      }

      const app = await tx.app.update({
        where: { id },
        data: {
          status: appStatus,
          publishedAt: appStatus === AppStatus.PUBLISHED ? new Date() : undefined
        }
      });

      return { review, app };
    });

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: result.review,
      app: result.app
    });

  } catch (error: any) {
    console.error('POST /api/admin/apps/[id]/review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
