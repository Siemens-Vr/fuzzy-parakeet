// app/api/payments/webhook/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripeClient, stripe } from '@/lib/stripe';
import { STRIPE_CONFIG } from '@/lib/payments';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripeClient.constructWebhookEvent(body, signature);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        
        if (paymentIntent.metadata?.appId && paymentIntent.metadata?.userId) {
          await prisma.purchase.updateMany({
            where: {
              appId: paymentIntent.metadata.appId,
              userId: paymentIntent.metadata.userId,
              status: 'PENDING',
            },
            data: {
              status: 'FAILED',
            },
          });
        }
        break;
      }

      case 'account.updated': {
        // Handle Stripe Connect account updates
        const account = event.data.object as Stripe.Account;
        console.log('Connect account updated:', account.id);
        
        // Update developer's Stripe account status in database
        // await updateDeveloperStripeStatus(account);
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer;
        console.log('Transfer created:', transfer.id);
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        console.log('Payout completed:', payout.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { appId, userId, platformFee, developerAmount } = session.metadata || {};

  if (!appId || !userId) {
    console.error('Missing metadata in session:', session.id);
    return;
  }

  // Get the app and developer info
  const app = await prisma.app.findUnique({
    where: { id: appId },
    include: {
      developer: true,
    },
  });

  if (!app) {
    console.error('App not found:', appId);
    return;
  }

  const amount = (session.amount_total || 0) / 100; // Convert from cents
  const devAmount = parseFloat(developerAmount || '0');

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
      totalAmount: amount,
      completedAt: new Date(),
    },
  });

  // Create transaction record
  await prisma.transaction.create({
    data: {
      appId,
      userId,
      amount,
      type: 'PURCHASE',
      status: 'COMPLETED',
    },
  });

  // Update app revenue and downloads
  await prisma.app.update({
    where: { id: appId },
    data: {
      revenue: { increment: devAmount },
      downloads: { increment: 1 },
    },
  });

  console.log(`Stripe payment completed: App ${appId}, User ${userId}, Amount ${amount}`);
  console.log(`Platform fee: ${platformFee}, Developer amount: ${developerAmount}`);

  // Send confirmation email
  // await sendPurchaseConfirmationEmail(userId, appId);
}

async function handleRefund(charge: Stripe.Charge) {
  // Handle refund logic
  const paymentIntentId = typeof charge.payment_intent === 'string' 
    ? charge.payment_intent 
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  // Find the original purchase and mark as refunded
  // This would require storing the payment intent ID with the purchase

  console.log('Processing refund for payment intent:', paymentIntentId);

  // Create refund transaction record
  // Update app revenue (subtract refund amount)
  // Update purchase status to REFUNDED
}

// Disable body parsing for webhook route
export const config = {
  api: {
    bodyParser: false,
  },
};