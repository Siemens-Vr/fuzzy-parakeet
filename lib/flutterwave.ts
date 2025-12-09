// lib/flutterwave.ts

import { FLUTTERWAVE_CONFIG, calculatePaymentSplit, generateTxRef } from './payments';
import { FlutterwavePaymentRequest, Currency } from '@/types/payments';

class FlutterwaveClient {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = FLUTTERWAVE_CONFIG.secretKey;
    this.baseUrl = FLUTTERWAVE_CONFIG.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Flutterwave API error');
    }

    return data;
  }

  // Create a payment link for checkout
  async createPaymentLink(params: {
    appId: string;
    appName: string;
    appIcon: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    amount: number;
    currency: Currency;
    redirectUrl: string;
    developerSubaccountId?: string;
  }): Promise<{ link: string; txRef: string }> {
    const { platformFee, developerAmount } = calculatePaymentSplit(params.amount);
    const txRef = generateTxRef(params.appId, params.userId);

    const payload: FlutterwavePaymentRequest = {
      tx_ref: txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      payment_options: params.currency === 'KES' ? 'mpesa,card,banktransfer' : 'card,mobilemoney,banktransfer',
      meta: {
        appId: params.appId,
        userId: params.userId,
        platformFee,
        developerAmount,
      },
      customer: {
        email: params.userEmail,
        name: params.userName,
        phonenumber: params.userPhone,
      },
      customizations: {
        title: 'VR App Store',
        description: `Purchase: ${params.appName}`,
        logo: params.appIcon || 'https://your-domain.com/logo.png',
      },
    };

    // If developer has a Flutterwave subaccount, use split payments
    if (params.developerSubaccountId) {
      payload.subaccounts = [
        {
          id: params.developerSubaccountId,
          transaction_charge_type: 'percentage',
          transaction_charge: 70, // Developer gets 70%
        },
      ];
    }

    const response = await this.request<{
      status: string;
      message: string;
      data: { link: string };
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      link: response.data.link,
      txRef,
    };
  }

  // Verify a transaction
  async verifyTransaction(transactionId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    txRef: string;
    meta: any;
  }> {
    const response = await this.request<{
      status: string;
      data: {
        status: string;
        amount: number;
        currency: string;
        tx_ref: string;
        meta: any;
      };
    }>(`/transactions/${transactionId}/verify`);

    return {
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      txRef: response.data.tx_ref,
      meta: response.data.meta,
    };
  }

  // Initiate M-Pesa payment directly (for mobile)
  async initiateMpesaPayment(params: {
    txRef: string;
    amount: number;
    phoneNumber: string;
    appName: string;
    appId: string;
    userId: string;
  }): Promise<{ status: string; message: string }> {
    const { platformFee, developerAmount } = calculatePaymentSplit(params.amount);

    const response = await this.request<{
      status: string;
      message: string;
    }>('/charges?type=mpesa', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: params.txRef,
        amount: params.amount,
        currency: 'KES',
        phone_number: params.phoneNumber,
        email: 'customer@email.com', // Fallback
        meta: {
          appId: params.appId,
          userId: params.userId,
          platformFee,
          developerAmount,
        },
      }),
    });

    return response;
  }

  // Create a subaccount for a developer (for split payments)
  async createDeveloperSubaccount(params: {
    businessName: string;
    email: string;
    phoneNumber: string;
    bankCode: string;
    accountNumber: string;
    country: string;
  }): Promise<{ subaccountId: string }> {
    const response = await this.request<{
      status: string;
      data: { id: number; subaccount_id: string };
    }>('/subaccounts', {
      method: 'POST',
      body: JSON.stringify({
        account_bank: params.bankCode,
        account_number: params.accountNumber,
        business_name: params.businessName,
        business_email: params.email,
        business_contact: params.phoneNumber,
        business_contact_mobile: params.phoneNumber,
        country: params.country,
        split_type: 'percentage',
        split_value: 70, // Developer gets 70%
      }),
    });

    return { subaccountId: response.data.subaccount_id };
  }

  // Initiate a transfer/payout to developer
  async initiateTransfer(params: {
    amount: number;
    currency: Currency;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    narration: string;
    reference: string;
  }): Promise<{ transferId: number; status: string }> {
    const response = await this.request<{
      status: string;
      data: { id: number; status: string };
    }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        account_bank: params.bankCode,
        account_number: params.accountNumber,
        amount: params.amount,
        currency: params.currency,
        narration: params.narration,
        reference: params.reference,
        beneficiary_name: params.accountName,
      }),
    });

    return {
      transferId: response.data.id,
      status: response.data.status,
    };
  }

  // Initiate mobile money transfer (for M-Pesa payouts)
  async initiateMobileMoneyTransfer(params: {
    amount: number;
    currency: Currency;
    phoneNumber: string;
    network: string;
    narration: string;
    reference: string;
  }): Promise<{ transferId: number; status: string }> {
    const response = await this.request<{
      status: string;
      data: { id: number; status: string };
    }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        account_bank: params.network.toUpperCase(), // e.g., 'MPS' for M-Pesa
        account_number: params.phoneNumber,
        amount: params.amount,
        currency: params.currency,
        narration: params.narration,
        reference: params.reference,
      }),
    });

    return {
      transferId: response.data.id,
      status: response.data.status,
    };
  }

  // Get banks list for a country
  async getBanks(country: string): Promise<Array<{ code: string; name: string }>> {
    const response = await this.request<{
      status: string;
      data: Array<{ code: string; name: string }>;
    }>(`/banks/${country}`);

    return response.data;
  }

  // Verify webhook signature
  verifyWebhookSignature(signature: string, secretHash: string): boolean {
    return signature === secretHash;
  }
}

export const flutterwaveClient = new FlutterwaveClient();
