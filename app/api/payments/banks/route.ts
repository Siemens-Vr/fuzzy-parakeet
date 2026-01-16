// app/api/payments/banks/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { flutterwaveClient } from '@/lib/flutterwave';

// Get list of banks for a country
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'KE';

    const banks = await flutterwaveClient.getBanks(country);

    return NextResponse.json({
      country,
      banks: banks.map(bank => ({
        code: bank.code,
        name: bank.name,
      })),
    });

  } catch (error: any) {
    console.error('Get banks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get banks list' },
      { status: 500 }
    );
  }
}