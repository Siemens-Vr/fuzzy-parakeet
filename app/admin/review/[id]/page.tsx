'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    status: 'PENDING',
    technicalPass: false,
    contentPass: false,
    notes: '',
    vrcResults: {
      performance: false,
      security: false,
      userInterface: false,
      contentGuidelines: false,
      compatibility: false
    }
  });

  useEffect(() => {
    fetchAppDetails();
  }, [params.id]);

  const fetchAppDetails = async () => {
    try {
      const response = await fetch(`/api/admin/apps/${params.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApp(data);
      }
    } catch (error) {
      console.error('Error fetching app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVRCChange = (key: string) => {
    setReviewForm(prev => ({
      ...prev,
      vrcResults: {
        ...prev.vrcResults,
        [key]: !prev.vrcResults[key]
      }
    }));
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/apps/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(reviewForm)
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        router.push('/admin/dashboard');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 50,
            height: 50,
            border: '4px solid #e5e7eb',
            borderTopColor: '#667eea',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>App not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Review App Submission</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>{app.name} - v{app.version}</p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
      </header>

      <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
          {/* Left Column - App Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* App Info Card */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>App Information</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>APP NAME</div>
                  <div style={{ fontWeight: 600 }}>{app.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>VERSION</div>
                  <div style={{ fontWeight: 600 }}>{app.version}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>CATEGORY</div>
                  <div style={{ fontWeight: 600 }}>{app.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>PRICE</div>
                  <div style={{ fontWeight: 600 }}>${app.price}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>DEVELOPER</div>
                  <div style={{ fontWeight: 600 }}>{app.developer?.organizationName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>SUBMITTED</div>
                  <div style={{ fontWeight: 600 }}>{new Date(app.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>DESCRIPTION</div>
                <div style={{ lineHeight: 1.6 }}>{app.description}</div>
              </div>
            </div>

            {/* Technical Details */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Technical Details</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>FILE SIZE</div>
                  <div style={{ fontWeight: 600 }}>{(Number(app.sizeBytes) / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>MIN API LEVEL</div>
                  <div style={{ fontWeight: 600 }}>{app.minApiLevel}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>TARGET DEVICES</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(app.targetDevices || []).map((device: string, i: number) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        background: '#f3f4f6',
                        borderRadius: 6,
                        fontSize: 13
                      }}>
                        {device}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>PERMISSIONS</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(app.permissions || []).map((perm: string, i: number) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        background: '#fef3c7',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#92400e'
                      }}>
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Preview */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Assets</h2>
              
              {app.iconUrl && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>APP ICON</div>
                  <img 
                    src={app.iconUrl} 
                    alt="App icon" 
                    style={{ width: 100, height: 100, borderRadius: 12, border: '1px solid #e5e7eb' }}
                  />
                </div>
              )}

              {app.screenshots && app.screenshots.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>SCREENSHOTS</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {app.screenshots.slice(0, 4).map((screenshot: string, i: number) => (
                      <img 
                        key={i}
                        src={screenshot} 
                        alt={`Screenshot ${i + 1}`} 
                        style={{ width: 150, height: 84, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Review Form */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
            height: 'fit-content',
            position: 'sticky',
            top: 24
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Review Submission</h2>

            {/* VRC Checklist */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>VRC Compliance Check</div>
              {Object.entries({
                performance: 'Performance Standards',
                security: 'Security Requirements',
                userInterface: 'UI/UX Guidelines',
                contentGuidelines: 'Content Guidelines',
                compatibility: 'Device Compatibility'
              }).map(([key, label]) => (
                <label key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={reviewForm.vrcResults[key]}
                    onChange={() => handleVRCChange(key)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 14 }}>{label}</span>
                </label>
              ))}
            </div>

            {/* Technical Pass */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Technical Review</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={reviewForm.technicalPass}
                  onChange={(e) => setReviewForm({ ...reviewForm, technicalPass: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span>Passes technical requirements</span>
              </label>
            </div>

            {/* Content Pass */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Content Review</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={reviewForm.contentPass}
                  onChange={(e) => setReviewForm({ ...reviewForm, contentPass: e.target.checked })}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span>Meets content guidelines</span>
              </label>
            </div>

            {/* Review Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Review Notes
              </label>
              <textarea
                value={reviewForm.notes}
                onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                placeholder="Add any notes or feedback for the developer..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Review Decision */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Review Decision
              </label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approve & Publish</option>
                <option value="REJECTED">Reject</option>
                <option value="CHANGES_REQUESTED">Request Changes</option>
              </select>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              onClick={handleSubmitReview}
              disabled={submitting}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 8,
                border: 'none',
                background: submitting ? '#9ca3af' : 
                  reviewForm.status === 'APPROVED' ? '#10b981' :
                  reviewForm.status === 'REJECTED' ? '#ef4444' :
                  '#667eea',
                color: 'white',
                fontSize: 16,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </motion.button>

            {/* Warning for rejection */}
            {reviewForm.status === 'REJECTED' && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: '#fee2e2',
                borderRadius: 8,
                fontSize: 13,
                color: '#991b1b'
              }}>
                ⚠️ Rejecting this app will suspend it from the store. Make sure to provide detailed feedback.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}