'use client';

import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%'
                    }}
                />
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Please log in to view your profile</h2>
                    <Link href="/auth/login" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>Go to Login</Link>
                </div>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            {/* Hero / Banner */}
            <div style={{
                height: 240,
                background: 'linear-gradient(to right, #1e293b, #0f172a)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
                }} />
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', transform: 'translateY(-80px)' }}>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginBottom: 32 }}>
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: '6px solid #0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 64,
                            fontWeight: 700,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </motion.div>

                    <div style={{ flex: 1, paddingBottom: 16 }}>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px 0' }}
                        >
                            {user.name}
                        </motion.h1>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                padding: '4px 12px',
                                borderRadius: 20,
                                fontSize: 14,
                                fontWeight: 600,
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                {user.role}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: 14 }}>
                                {user.email}
                            </span>
                        </div>
                    </div>

                    <div style={{ paddingBottom: 16 }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: 12,
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Edit Profile
                        </motion.button>
                    </div>
                </div>

                {/* Content Tabs */}
                <div style={{ display: 'flex', gap: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Overview', 'My Apps', 'Wishlist', 'Settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeTab === tab.toLowerCase().replace(' ', '') ? '#60a5fa' : '#94a3b8',
                                fontSize: 16,
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '8px 0',
                                position: 'relative'
                            }}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase().replace(' ', '') && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: 'absolute',
                                        bottom: -25,
                                        left: 0,
                                        right: 0,
                                        height: 2,
                                        background: '#60a5fa'
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: 32 }}>
                    {/* Placeholder Grid for "My Apps" style cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: 20,
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    height: 160,
                                    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))`
                                }} />
                                <div style={{ padding: 20 }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Example App {i}</h3>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Last played 2 days ago</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
