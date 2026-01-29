'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function DeveloperJoinPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
        websiteUrl: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agreed) {
            setError('You must agree to the Developer Terms of Service');
            return;
        }

        if (!formData.organizationName.trim()) {
            setError('Organization name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/developer/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create developer account');
            }

            // Refresh user data to include developer profile
            await refreshUser();

            // Redirect to developer dashboard
            router.push('/developer');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: 20
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: '#1e293b',
                    borderRadius: 16,
                    padding: 40,
                    maxWidth: 520,
                    width: '100%',
                    border: '1px solid #334155',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{
                    width: 70,
                    height: 70,
                    margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32
                }}>
                    👨‍💻
                </div>

                <h1 style={{
                    color: '#f8fafc',
                    fontSize: 26,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 8
                }}>
                    Join as a Developer
                </h1>

                <p style={{
                    color: '#94a3b8',
                    fontSize: 15,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginBottom: 32
                }}>
                    Create your developer account and start publishing VR apps today.
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            padding: '12px 16px',
                            marginBottom: 20,
                            color: '#dc2626',
                            fontSize: 14
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            color: '#e2e8f0',
                            fontSize: 14,
                            fontWeight: 500,
                            marginBottom: 8
                        }}>
                            Organization / Studio Name *
                        </label>
                        <input
                            type="text"
                            value={formData.organizationName}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            placeholder="e.g., Awesome VR Studios"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                color: '#f8fafc',
                                fontSize: 15,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            color: '#e2e8f0',
                            fontSize: 14,
                            fontWeight: 500,
                            marginBottom: 8
                        }}>
                            Website URL (optional)
                        </label>
                        <input
                            type="url"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            placeholder="https://yourstudio.com"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: 8,
                                color: '#f8fafc',
                                fontSize: 15,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                style={{
                                    width: 20,
                                    height: 20,
                                    marginTop: 2,
                                    accentColor: '#3b82f6'
                                }}
                            />
                            <span style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>
                                I agree to the{' '}
                                <a href="/legal/developer-terms" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                    Developer Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/legal/privacy" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                    Privacy Policy
                                </a>
                            </span>
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        style={{
                            width: '100%',
                            padding: '14px 28px',
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#fff',
                            background: loading
                                ? '#64748b'
                                : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            border: 'none',
                            borderRadius: 10,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: 16
                        }}
                    >
                        {loading ? 'Creating account...' : 'Create Developer Account'}
                    </motion.button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            width: '100%',
                            padding: '12px 28px',
                            fontSize: 15,
                            fontWeight: 500,
                            color: '#94a3b8',
                            background: 'transparent',
                            border: '1px solid #334155',
                            borderRadius: 10,
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </form>

                <p style={{
                    color: '#64748b',
                    fontSize: 13,
                    textAlign: 'center',
                    marginTop: 24
                }}>
                    Signed in as {user?.email}
                </p>
            </motion.div>
        </div>
    );
}
