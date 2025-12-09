// lib/stripe.ts

import Stripe from 'stripe';
import { STRIPE_CONFIG, calculatePaymentSplit } from './payments';
import { Currency } from '@/types/payments';

// Initialize Stripe with the secret key
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2023-10-16',
});

export { stripe };

class StripeClient {
  // Create a checkout session for app purchase
  async createCheckoutSession(params: {
    appId: string;
    appName: string;
    appIcon: string;
    appDescription: string;
    userId: string;
    userEmail: string;
    amount: number; // in cents
    currency: Currency;
    successUrl: string;
    cancelUrl: string;
    developerStripeAccountId?: string;
  }): Promise<{ sessionId: string; url: string }> {
    const { platformFee, developerAmount } = calculatePaymentSplit(params.amount / 100);
    const platformFeeAmount = Math.round(platformFee * 100); // Convert back to cents

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: params.userEmail,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.appName,
              description: params.appDescription,
              images: params.appIcon ? [params.appIcon] : [],
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        appId: params.appId,
        userId: params.userId,
        platformFee: platformFee.toString(),
        developerAmount: developerAmount.toString(),
      },
    };

    // If developer has Stripe Connect, use split payments
    if (params.developerStripeAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: params.developerStripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  // Create a Stripe Connect account for a developer
  async createConnectAccount(params: {
    email: string;
    country: string;
    businessName: string;
  }): Promise<{ accountId: string }> {
    const account = await stripe.accounts.create({
      type: 'express',
      country: params.country,
      email: params.email,
      business_profile: {
        name: params.businessName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return { accountId: account.id };
  }

  // Create account onboarding link for developer
  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    const accountLink = await stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }

  // Check if Connect account is fully set up
  async getAccountStatus(accountId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
  }> {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  }

  // Create a transfer to developer account
  async createTransfer(params: {
    amount: number; // in cents
    currency: Currency;
    destinationAccountId: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<{ transferId: string }> {
    const transfer = await stripe.transfers.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      destination: params.destinationAccountId,
      description: params.description,
      metadata: params.metadata,
    });

    return { transferId: transfer.id };
  }

  // Create a payout to connected account's bank
  async createPayout(params: {
    accountId: string;
    amount: number;
    currency: Currency;
  }): Promise<{ payoutId: string }> {
    const payout = await stripe.payouts.create(
      {
        amount: params.amount,
        currency: params.currency.toLowerCase(),
      },
      {
        stripeAccount: params.accountId,
      }
    );

    return { payoutId: payout.id };
  }

  // Retrieve a checkout session
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }

  // Construct webhook event
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  }

  // Get account balance
  async getBalance(accountId?: string): Promise<{
    available: Stripe.Balance.Available[];
    pending: Stripe.Balance.Pending[];
  }> {
    const options = accountId ? { stripeAccount: accountId } : undefined;
    const balance = await stripe.balance.retrieve(options);

    return {
      available: balance.available,
      pending: balance.pending,
    };
  }

  // Create a refund
  async createRefund(params: {
    paymentIntentId: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  }): Promise<{ refundId: string }> {
    const refund = await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount,
      reason: params.reason,
    });

    return { refundId: refund.id };
  }
}

export const stripeClient = new StripeClient();
