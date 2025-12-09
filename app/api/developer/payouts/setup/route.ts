// app/api/developer/payouts/setup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeveloper } from '@/lib/auth';
import { flutterwaveClient } from '@/lib/flutterwave';
import { stripeClient } from '@/lib/stripe';
import { Currency, CURRENCY_COUNTRY_MAP } from '@/lib/payments';

// POST - Setup payout account
export async function POST(req: NextRequest) {
  try {
    const { developerId, tokenPayload } = await requireDeveloper(req);
    const body = await req.json();
    
    const { 
      provider, // 'FLUTTERWAVE' or 'STRIPE'
      country,
      currency,
      // For Flutterwave
      bankCode,
      accountNumber,
      businessName,
      phoneNumber,
      // For mobile money
      mobileMoneyPhone,
      mobileMoneyNetwork,
    } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Payment provider is required' },
        { status: 400 }
      );
    }

    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    if (provider === 'FLUTTERWAVE') {
      // Create Flutterwave subaccount for split payments
      if (!bankCode || !accountNumber || !businessName) {
        return NextResponse.json(
          { error: 'Bank details required for Flutterwave' },
          { status: 400 }
        );
      }

      const result = await flutterwaveClient.createDeveloperSubaccount({
        businessName: businessName || developer.organizationName,
        email: developer.user.email,
        phoneNumber: phoneNumber || '',
        bankCode,
        accountNumber,
        country: country || 'KE',
      });

      // Store subaccount ID (you'd need to add this field to the Developer model)
      // await prisma.developer.update({
      //   where: { id: developerId },
      //   data: { flutterwaveSubaccountId: result.subaccountId },
      // });

      return NextResponse.json({
        success: true,
        provider: 'FLUTTERWAVE',
        subaccountId: result.subaccountId,
        message: 'Flutterwave payout account created successfully',
      });

    } else if (provider === 'STRIPE') {
      // Create Stripe Connect account
      const account = await stripeClient.createConnectAccount({
        email: developer.user.email,
        country: country || 'US',
        businessName: developer.organizationName,
      });

      // Create onboarding link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const accountLink = await stripeClient.createAccountLink({
        accountId: account.accountId,
        refreshUrl: `${baseUrl}/developer/payouts?refresh=true`,
        returnUrl: `${baseUrl}/developer/payouts?success=true`,
      });

      // Store account ID (you'd need to add this field to the Developer model)
      // await prisma.developer.update({
      //   where: { id: developerId },
      //   data: { stripeConnectAccountId: account.accountId },
      // });

      return NextResponse.json({
        success: true,
        provider: 'STRIPE',
        accountId: account.accountId,
        onboardingUrl: accountLink.url,
        message: 'Stripe Connect account created. Complete onboarding to receive payments.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Payout setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup payout account' },
      { status: 500 }
    );
  }
}

// GET - Get payout account status
export async function GET(req: NextRequest) {
  try {
    const { developerId } = await requireDeveloper(req);

    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: {
        id: true,
        organizationName: true,
        // flutterwaveSubaccountId: true,
        // stripeConnectAccountId: true,
        // payoutCurrency: true,
        // payoutMethod: true,
      },
    });

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    // Check Stripe Connect status if account exists
    let stripeStatus = null;
    // if (developer.stripeConnectAccountId) {
    //   stripeStatus = await stripeClient.getAccountStatus(developer.stripeConnectAccountId);
    // }

    return NextResponse.json({
      developer: {
        id: developer.id,
        organizationName: developer.organizationName,
      },
      // flutterwave: {
      //   connected: !!developer.flutterwaveSubaccountId,
      //   subaccountId: developer.flutterwaveSubaccountId,
      // },
      // stripe: {
      //   connected: !!developer.stripeConnectAccountId,
      //   accountId: developer.stripeConnectAccountId,
      //   ...stripeStatus,
      // },
      flutterwave: { connected: false },
      stripe: { connected: false },
    });

  } catch (error: any) {
    console.error('Get payout status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get payout status' },
      { status: 500 }
    );
  }
}