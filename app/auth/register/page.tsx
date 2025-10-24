'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    websiteUrl: '',
    agreeToTerms: false,
  });

  const validateStep1 = () => {
    if (!formData.name || !formData.email) return false;
    if (!formData.email.includes('@')) return false;
    return true;
  };

  const validateStep2 = () => {
    if (formData.password.length < 8) return false;
    if (formData.password !== formData.confirmPassword) return false;
    return true;
  };

  const validateStep3 = () => {
    if (!formData.organizationName) return false;
    if (!formData.agreeToTerms) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      setError('Please fill all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        websiteUrl: formData.websiteUrl || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 24
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          maxWidth: 540,
          width: '100%'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 40,
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0' }}>
            Create Developer Account
          </h1>
          <p style={{ fontSize: 15, opacity: 0.9, margin: 0 }}>
            Step {step} of 3
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 4,
          background: '#e5e7eb'
        }}>
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #667eea, #764ba2)'
            }}
          />
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
              fontWeight: 600
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        {/* Form */}
        <div style={{ padding: 40 }}>
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
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
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
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
                  placeholder="john@company.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => validateStep1() && setStep(2)}
                disabled={!validateStep1()}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 12,
                  border: 'none',
                  background: validateStep1() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: validateStep1() ? 'pointer' : 'not-allowed'
                }}
              >
                Continue →
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
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
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
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
                    outline: 'none'
                  }}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div style={{ color: '#ef4444', fontSize: 13, marginTop: 6 }}>
                    Passwords do not match
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => validateStep2() && setStep(3)}
                  disabled={!validateStep2()}
                  style={{
                    flex: 2,
                    padding: '16px',
                    borderRadius: 12,
                    border: 'none',
                    background: validateStep2() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: validateStep2() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Organization */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: 8
                }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="Your Company Inc."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    fontSize: 15,
                    outline: 'none'
                  }}
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
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://yourcompany.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    fontSize: 15,
                    outline: 'none'
                  }}
                />
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
                  style={{ marginTop: 4, cursor: 'pointer', accentColor: '#667eea' }}
                />
                <span style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  I agree to the <strong style={{ color: '#667eea' }}>Terms of Service</strong> and{' '}
                  <strong style={{ color: '#667eea' }}>Privacy Policy</strong>
                </span>
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    background: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  onClick={handleSubmit}
                  disabled={!validateStep3() || loading}
                  style={{
                    flex: 2,
                    padding: '16px',
                    borderRadius: 12,
                    border: 'none',
                    background: validateStep3() && !loading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: validateStep3() && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12
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
              </div>
            </motion.div>
          )}

          <div style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 14,
            color: '#64748b'
          }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{
              color: '#667eea',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}