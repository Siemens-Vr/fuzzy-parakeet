// app/api/payments/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { flutterwaveClient } from '@/lib/flutterwave';
import { stripeClient } from '@/lib/stripe';
import { getBestPaymentProvider, calculatePaymentSplit } from '@/lib/payments';
import { Currency, PaymentProvider } from '@/types/payments';

function getUserFromToken(req: NextRequest) {
  const token = req.cookies.get('user_token')?.value;
  if (!token) return null;
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      name?: string;
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      appSlug, 
      currency = 'USD',
      paymentMethod,
      phoneNumber, // For M-Pesa
    } = body;

    if (!appSlug) {
      return NextResponse.json(
        { error: 'App slug is required' },
        { status: 400 }
      );
    }

    // Get app details
    const app = await prisma.app.findUnique({
      where: { slug: appSlug, status: 'PUBLISHED' },
      include: {
        developer: {
          select: {
            id: true,
            organizationName: true,
            user: { select: { email: true } },
            // These would be added to the schema
            // flutterwaveSubaccountId: true,
            // stripeConnectAccountId: true,
          },
        },
      },
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_appId: {
          userId: user.userId,
          appId: app.id,
        },
      },
    });

    if (existingPurchase?.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'You already own this app' },
        { status: 400 }
      );
    }

    // Free apps - create purchase directly
    if (app.price === 0) {
      const purchase = await prisma.purchase.upsert({
        where: {
          userId_appId: {
            userId: user.userId,
            appId: app.id,
          },
        },
        update: {
          status: 'COMPLETED',
          totalAmount: 0,
          completedAt: new Date(),
        },
        create: {
          userId: user.userId,
          appId: app.id,
          status: 'COMPLETED',
          totalAmount: 0,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        free: true,
        purchaseId: purchase.id,
      });
    }

    // Determine payment provider based on currency
    const provider: PaymentProvider = getBestPaymentProvider(currency as Currency);
    const { platformFee, developerAmount } = calculatePaymentSplit(app.price);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/purchase/success?session={CHECKOUT_SESSION_ID}&app=${appSlug}`;
    const cancelUrl = `${baseUrl}/apps/${appSlug}?cancelled=true`;

    // Get user details
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true },
    });

    let checkoutResult: { url: string; sessionId?: string; txRef?: string };

    if (provider === 'FLUTTERWAVE') {
      // Use Flutterwave for African payments
      const result = await flutterwaveClient.createPaymentLink({
        appId: app.id,
        appName: app.name,
        appIcon: app.iconUrl || '',
        userId: user.userId,
        userEmail: userDetails?.email || user.email,
        userName: userDetails?.name || 'Customer',
        userPhone: phoneNumber,
        amount: app.price,
        currency: currency as Currency,
        redirectUrl: successUrl.replace('{CHECKOUT_SESSION_ID}', ''),
        // developerSubaccountId: app.developer.flutterwaveSubaccountId,
      });

      checkoutResult = {
        url: result.link,
        txRef: result.txRef,
      };

      // Create pending purchase record
      await prisma.purchase.upsert({
        where: {
          userId_appId: {
            userId: user.userId,
            appId: app.id,
          },
        },
        update: {
          status: 'PENDING',
          totalAmount: app.price,
        },
        create: {
          userId: user.userId,
          appId: app.id,
          status: 'PENDING',
          totalAmount: app.price,
        },
      });

    } else {
      // Use Stripe for international payments
      const amountInCents = Math.round(app.price * 100);
      
      const result = await stripeClient.createCheckoutSession({
        appId: app.id,
        appName: app.name,
        appIcon: app.iconUrl || '',
        appDescription: app.summary,
        userId: user.userId,
        userEmail: userDetails?.email || user.email,
        amount: amountInCents,
        currency: currency as Currency,
        successUrl,
        cancelUrl,
        // developerStripeAccountId: app.developer.stripeConnectAccountId,
      });

      checkoutResult = {
        url: result.url,
        sessionId: result.sessionId,
      };

      // Create pending purchase record
      await prisma.purchase.upsert({
        where: {
          userId_appId: {
            userId: user.userId,
            appId: app.id,
          },
        },
        update: {
          status: 'PENDING',
          totalAmount: app.price,
        },
        create: {
          userId: user.userId,
          appId: app.id,
          status: 'PENDING',
          totalAmount: app.price,
        },
      });
    }

    return NextResponse.json({
      success: true,
      provider,
      ...checkoutResult,
      platformFee,
      developerAmount,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}

// Get checkout status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session');
    const txRef = searchParams.get('tx_ref');

    if (sessionId) {
      // Stripe session
      const session = await stripeClient.retrieveSession(sessionId);
      
      return NextResponse.json({
        status: session.payment_status,
        appId: session.metadata?.appId,
        userId: session.metadata?.userId,
      });
    }

    if (txRef) {
      // Flutterwave transaction
      // Would need to look up by tx_ref in database
      return NextResponse.json({
        status: 'pending',
        message: 'Check webhook for final status',
      });
    }

    return NextResponse.json(
      { error: 'Session ID or TX ref required' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Get checkout status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}