// app/auth/user/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UserLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Show success message if just registered
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to original page or home
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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
      background: 'linear-gradient(135deg, #0066cc 0%, #00b894 100%)',
      padding: 24
    }}>
      {/* Background Animation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity: 0.1
      }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), y: -100 }}
            animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100 }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 40 + 10,
              height: Math.random() * 40 + 10,
              borderRadius: '50%',
              background: 'white',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          maxWidth: 440,
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0066cc 0%, #00b894 100%)',
          padding: 40,
          textAlign: 'center',
          color: 'white'
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36
            }}
          >
            🎮
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0' }}>
            Welcome Back!
          </h1>
          <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>
            Sign in to download VR apps
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: 16,
              margin: 24,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <span style={{ fontSize: 20 }}>✓</span>
            Registration successful! Please sign in to continue.
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: 16,
              margin: 24,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <span style={{ fontSize: 20 }}>⚠️</span>
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 40 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: 8
            }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '2px solid #e5e7eb',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0066cc'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#0f172a',
              marginBottom: 8
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '2px solid #e5e7eb',
                fontSize: 15,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0066cc'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: 14,
              color: '#64748b'
            }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                style={{ cursor: 'pointer', accentColor: '#0066cc' }}
              />
              Remember me
            </label>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #0066cc 0%, #00b894 100%)',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: loading ? 'none' : '0 8px 16px rgba(0, 102, 204, 0.3)'
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 20,
                    height: 20,
                    border: '3px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%'
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span style={{ fontSize: 20 }}>→</span>
              </>
            )}
          </motion.button>

          <div style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#64748b'
          }}>
            Don't have an account?{' '}
            <Link href="/auth/user/register" style={{
              color: '#0066cc',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Sign up
            </Link>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 14,
            color: '#64748b'
          }}>
            Are you a developer?{' '}
            <Link href="/auth/login" style={{
              color: '#00b894',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Developer Portal
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}