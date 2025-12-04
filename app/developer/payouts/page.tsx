'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PayoutInfo = {
  stripeConnected: boolean;
  stripeAccountStatus: string | null;
  payoutsEnabled: boolean;
  currency: string;
  platformFeePercent: number;
  pendingBalance: number;
  totalEarnings: number;
  recentPayouts: Payout[];
  earningsByApp: AppEarning[];
};

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  processedAt: string | null;
  createdAt: string;
};

type AppEarning = {
  appId: string;
  appName: string;
  appIcon: string | null;
  totalEarnings: number;
  salesCount: number;
};

export default function DeveloperPayoutsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
    fetchPayoutInfo();
  }, [searchParams]);

  const fetchPayoutInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/developer/payouts');
      if (res.ok) {
        const data = await res.json();
        setPayoutInfo(data);
      }
    } catch (err) {
      console.error('Error fetching payout info:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupStripeConnect = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch('/api/developer/payouts/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'US' }), // Could add country selector
      });

      if (res.ok) {
        const data = await res.json();
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to set up payouts');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to set up payouts');
    } finally {
      setSetupLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#dcfce7', color: '#166534' };
      case 'PROCESSING':
        return { bg: '#fef9c3', color: '#854d0e' };
      case 'PENDING':
        return { bg: '#f1f5f9', color: '#334155' };
      case 'FAILED':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f1f5f9', color: '#334155' };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Success Banner */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '16px 24px',
            borderRadius: 12,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>✓</span>
          <span style={{ fontWeight: 600 }}>
            Stripe Connect setup complete! Your payouts are now enabled.
          </span>
        </motion.div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Payouts</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>
          Manage your earnings and payout settings
        </p>
      </div>

      {/* Stripe Connect Setup Banner */}
      {!payoutInfo?.stripeConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: 20,
            padding: 32,
            marginBottom: 32,
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 64 }}>🏦</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
                Set Up Payouts
              </h2>
              <p style={{ opacity: 0.9, margin: '0 0 20px', lineHeight: 1.6 }}>
                Connect your bank account to receive earnings from your app sales.
                We use Stripe for secure, reliable payouts worldwide.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={setupStripeConnect}
                disabled={setupLoading}
                style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'white',
                  color: '#667eea',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: setupLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {setupLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 20,
                        height: 20,
                        border: '2px solid #667eea',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                      }}
                    />
                    Setting up...
                  </>
                ) : (
                  <>
                    Connect Bank Account
                    <span>→</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending Onboarding Banner */}
      {payoutInfo?.stripeConnected && !payoutInfo.payoutsEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#fef9c3',
            border: '2px solid #fbbf24',
            borderRadius: 16,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, margin: '0 0 4px', color: '#854d0e' }}>
                Complete Your Stripe Setup
              </h3>
              <p style={{ margin: 0, color: '#92400e', fontSize: 14 }}>
                Your account setup is incomplete. Please finish providing your information
                to start receiving payouts.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={setupStripeConnect}
              disabled={setupLoading}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: '#854d0e',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue Setup
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            Available Balance
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
            ${payoutInfo?.pendingBalance.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Ready for payout
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            Total Earnings
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
            ${payoutInfo?.totalEarnings.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            All time
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            Platform Fee
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#6366f1' }}>
            {payoutInfo?.platformFeePercent || 30}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            You keep {100 - (payoutInfo?.platformFeePercent || 30)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
            Payout Status
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: payoutInfo?.payoutsEnabled ? '#10b981' : '#f59e0b',
            }}
          >
            {payoutInfo?.payoutsEnabled ? '✓ Active' : '⏳ Pending Setup'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            {payoutInfo?.currency.toUpperCase() || 'USD'}
          </div>
        </motion.div>
      </div>

      {/* Earnings by App */}
      {payoutInfo?.earningsByApp && payoutInfo.earningsByApp.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: 24,
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
            Earnings by App
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payoutInfo.earningsByApp.map((app, index) => (
              <motion.div
                key={app.appId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  background: '#f8fafc',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: app.appIcon
                      ? `url(${app.appIcon})`
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    backgroundSize: 'cover',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{app.appName}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {app.salesCount} sale{app.salesCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#10b981' }}>
                    ${app.totalEarnings.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Payouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Payouts</h2>
        </div>

        {payoutInfo?.recentPayouts && payoutInfo.recentPayouts.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Period
                </th>
                <th
                  style={{
                    padding: '12px 24px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '12px 24px',
                    textAlign: 'right',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {payoutInfo.recentPayouts.map((payout) => {
                const statusStyle = getStatusColor(payout.status);
                return (
                  <tr key={payout.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px' }}>
                      {formatDate(payout.createdAt)}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: 14 }}>
                      {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '16px 24px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: '#10b981',
                      }}
                    >
                      ${payout.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💸</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No payouts yet</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              When you make sales, your earnings will appear here
            </p>
          </div>
        )}
      </motion.div>

      {/* Info Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          marginTop: 32,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>📅</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#1e40af' }}>
            Payout Schedule
          </h3>
          <p style={{ fontSize: 14, color: '#1e3a8a', lineHeight: 1.6 }}>
            Payouts are processed automatically every week on Monday. You'll receive
            your earnings via direct deposit to your connected bank account.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#166534' }}>
            Secure Payments
          </h3>
          <p style={{ fontSize: 14, color: '#15803d', lineHeight: 1.6 }}>
            All payments are processed securely through Stripe, trusted by millions
            of businesses worldwide. Your financial information is never stored on our
            servers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}