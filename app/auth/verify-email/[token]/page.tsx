'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = params.token;

                if (!token) {
                    setStatus('error');
                    setMessage('No verification token found.');
                    return;
                }

                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified! You can now log in.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed. The token may be invalid or expired.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        verifyToken();
    }, [params.token]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: 24,
            fontFamily: "'Inter', sans-serif"
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 24,
                    padding: 40,
                    maxWidth: 480,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <motion.div
                    animate={{
                        scale: status === 'verifying' ? [1, 1.1, 1] : 1,
                        rotate: status === 'verifying' ? 360 : 0
                    }}
                    transition={{
                        duration: status === 'verifying' ? 2 : 0.5,
                        repeat: status === 'verifying' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    style={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 24px',
                        borderRadius: '50%',
                        background: status === 'success'
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : status === 'error'
                                ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
                                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                        boxShadow: `0 0 30px ${status === 'success'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : status === 'error'
                                    ? 'rgba(239, 68, 68, 0.3)'
                                    : 'rgba(59, 130, 246, 0.3)'
                            }`
                    }}
                >
                    {status === 'verifying' && '🔄'}
                    {status === 'success' && '✓'}
                    {status === 'error' && '✕'}
                </motion.div>

                <h1 style={{
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 800,
                    marginBottom: 12
                }}>
                    {status === 'verifying' && 'Verifying Email...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h1>

                <p style={{
                    color: '#94a3b8',
                    fontSize: 16,
                    lineHeight: 1.6,
                    marginBottom: 32
                }}>
                    {message}
                </p>

                {status !== 'verifying' && (
                    <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: 12,
                                border: 'none',
                                background: 'white',
                                color: '#0f172a',
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                        >
                            Back to Login
                        </motion.button>
                    </Link>
                )}
            </motion.div>
        </div>
    );
}
