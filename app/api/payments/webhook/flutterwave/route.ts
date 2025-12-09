// app/api/payments/webhook/flutterwave/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { flutterwaveClient } from '@/lib/flutterwave';
import { FLUTTERWAVE_CONFIG, calculatePaymentSplit } from '@/lib/payments';
import { FlutterwaveWebhookPayload } from '@/types/payments';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('verif-hash');
    
    if (!signature || signature !== FLUTTERWAVE_CONFIG.webhookSecret) {
      console.error('Invalid Flutterwave webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload: FlutterwaveWebhookPayload = await req.json();
    
    console.log('Flutterwave webhook received:', payload.event);

    if (payload.event === 'charge.completed') {
      const { data } = payload;
      
      // Verify the transaction
      const verification = await flutterwaveClient.verifyTransaction(data.id.toString());
      
      if (verification.status !== 'successful') {
        console.error('Transaction verification failed:', verification);
        return NextResponse.json({ received: true });
      }

      const { appId, userId, platformFee, developerAmount } = data.meta;

      // Get the app and developer info
      const app = await prisma.app.findUnique({
        where: { id: appId },
        include: {
          developer: true,
        },
      });

      if (!app) {
        console.error('App not found:', appId);
        return NextResponse.json({ received: true });
      }

      // Update purchase status
      await prisma.purchase.upsert({
        where: {
          userId_appId: {
            userId,
            appId,
          },
        },
        update: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        create: {
          userId,
          appId,
          status: 'COMPLETED',
          totalAmount: data.amount,
          completedAt: new Date(),
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          appId,
          userId,
          amount: data.amount,
          type: 'PURCHASE',
          status: 'COMPLETED',
        },
      });

      // Update app revenue and downloads
      await prisma.app.update({
        where: { id: appId },
        data: {
          revenue: { increment: developerAmount },
          downloads: { increment: 1 },
        },
      });

      // Record developer earnings for payout
      // This would go into a separate earnings table
      console.log(`Payment completed: App ${appId}, User ${userId}, Amount ${data.amount} ${data.currency}`);
      console.log(`Platform fee: ${platformFee}, Developer amount: ${developerAmount}`);

      // Send confirmation email (implement your email service)
      // await sendPurchaseConfirmationEmail(userId, appId);
    }

    if (payload.event === 'transfer.completed') {
      // Handle payout completion
      const { data } = payload;
      console.log('Transfer completed:', data);
      
      // Update payout status in database
      // await updatePayoutStatus(data.reference, 'COMPLETED');
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}