// app/auth/user/register/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();

      const emailSent = data.emailSent !== false;
      // Redirect to login with success message
      router.push(`/auth/user/login?registered=true&email_sent=${emailSent}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create Account
          </h1>
          <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>
            Join us to download amazing VR apps
          </p>
        </div>

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
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
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
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
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
              Password * (min 8 characters)
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
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
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm password"
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
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>
                Passwords do not match
              </div>
            )}
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 32,
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              style={{ marginTop: 4, cursor: 'pointer', accentColor: '#0066cc' }}
            />
            <span style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              I agree to the <strong style={{ color: '#0066cc' }}>Terms of Service</strong> and{' '}
              <strong style={{ color: '#0066cc' }}>Privacy Policy</strong>
            </span>
          </label>

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
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span style={{ fontSize: 20 }}>✓</span>
              </>
            )}
          </motion.button>

          <div style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#64748b'
          }}>
            Already have an account?{' '}
            <Link href="/auth/user/login" style={{
              color: '#0066cc',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 14,
            color: '#64748b'
          }}>
            Are you a developer?{' '}
            <Link href="/auth/register" style={{
              color: '#00b894',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Developer Registration
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}