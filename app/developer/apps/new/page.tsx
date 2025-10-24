'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type UploadedFile = {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
};

export default function EnhancedAppSubmission() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    category: '',
    price: 0,
    version: '1.0.0',
    targetDevices: [] as string[],
    permissions: [] as string[],
    minApiLevel: 29,
    websiteUrl: '',
    privacyPolicyUrl: '',
    supportEmail: '',
    releaseNotes: ''
  });

  // File uploads
  const [apkFile, setApkFile] = useState<UploadedFile | null>(null);
  const [iconFile, setIconFile] = useState<UploadedFile | null>(null);
  const [screenshots, setScreenshots] = useState<UploadedFile[]>([]);
  const [heroImage, setHeroImage] = useState<UploadedFile | null>(null);
  const [trailerVideo, setTrailerVideo] = useState<UploadedFile | null>(null);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const apkInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = ['GAMES', 'EDUCATION', 'PRODUCTIVITY', 'ENTERTAINMENT', 'SOCIAL', 'UTILITIES', 'MEDICAL', 'FITNESS', 'ADVENTURE', 'SIMULATION'];
  const DEVICES = ['Quest 2', 'Quest 3', 'Quest Pro', 'Android Phone'];
  const PERMISSIONS = ['INTERNET', 'CAMERA', 'MICROPHONE', 'STORAGE', 'BLUETOOTH', 'VIBRATE', 'WAKE_LOCK'];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'targetDevices' | 'permissions', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  // File upload handlers
  const handleFileUpload = async (file: File, type: 'apk' | 'icon' | 'screenshot' | 'hero' | 'trailer') => {
    const uploadedFile: UploadedFile = {
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading'
    };

    // Update state based on type
    if (type === 'apk') setApkFile(uploadedFile);
    else if (type === 'icon') setIconFile(uploadedFile);
    else if (type === 'hero') setHeroImage(uploadedFile);
    else if (type === 'trailer') setTrailerVideo(uploadedFile);
    else if (type === 'screenshot') setScreenshots(prev => [...prev, uploadedFile]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          
          if (type === 'apk' && apkFile) {
            setApkFile(prev => prev ? { ...prev, progress } : null);
          } else if (type === 'icon' && iconFile) {
            setIconFile(prev => prev ? { ...prev, progress } : null);
          } else if (type === 'screenshot') {
            setScreenshots(prev => prev.map((s, i) => 
              i === prev.length - 1 ? { ...s, progress } : s
            ));
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          if (type === 'apk') {
            setApkFile(prev => prev ? { ...prev, status: 'completed', url: response.url, progress: 100 } : null);
          } else if (type === 'icon') {
            setIconFile(prev => prev ? { ...prev, status: 'completed', url: response.url, progress: 100 } : null);
          } else if (type === 'screenshot') {
            setScreenshots(prev => prev.map((s, i) => 
              i === prev.length - 1 ? { ...s, status: 'completed', url: response.url, progress: 100 } : s
            ));
          } else if (type === 'hero') {
            setHeroImage(prev => prev ? { ...prev, status: 'completed', url: response.url, progress: 100 } : null);
          } else if (type === 'trailer') {
            setTrailerVideo(prev => prev ? { ...prev, status: 'completed', url: response.url, progress: 100 } : null);
          }
        }
      });

      xhr.addEventListener('error', () => {
        if (type === 'apk') setApkFile(prev => prev ? { ...prev, status: 'error' } : null);
        else if (type === 'icon') setIconFile(prev => prev ? { ...prev, status: 'error' } : null);
        else if (type === 'screenshot') {
          setScreenshots(prev => prev.map((s, i) => 
            i === prev.length - 1 ? { ...s, status: 'error' } : s
          ));
        }
      });

      xhr.open('POST', '/api/upload/asset');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Drag and drop for APK
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const apk = files.find(f => f.name.endsWith('.apk'));
    
    if (apk) {
      handleFileUpload(apk, 'apk');
    }
  }, []);

  // Form validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.summary && formData.description && formData.category);
      case 2:
        return formData.targetDevices.length > 0 && formData.minApiLevel >= 23;
      case 3:
        return !!(apkFile?.status === 'completed' && iconFile?.status === 'completed' && screenshots.length >= 3);
      default:
        return true;
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });

      // Append file URLs
      if (apkFile?.url) submitData.append('apkUrl', apkFile.url);
      if (iconFile?.url) submitData.append('iconUrl', iconFile.url);
      if (heroImage?.url) submitData.append('heroImageUrl', heroImage.url);
      if (trailerVideo?.url) submitData.append('trailerUrl', trailerVideo.url);
      
      submitData.append('screenshots', JSON.stringify(screenshots.map(s => s.url).filter(Boolean)));

      const response = await fetch('/api/developer/apps', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) throw new Error('Submission failed');

      const result = await response.json();
      router.push(`/developer/apps/${result.id}/success`);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Basic Info', icon: '📝' },
    { number: 2, label: 'Technical Details', icon: '⚙️' },
    { number: 3, label: 'Upload Assets', icon: '📤' },
    { number: 4, label: 'Review & Submit', icon: '✓' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa', padding: '24px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Submit New Application
          </h1>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 15 }}>
            Provide details, upload assets, and submit your app for review
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 40,
            background: 'white',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #e5e7eb'
          }}
        >
          {steps.map((step, index) => (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <motion.div
                  whileHover={{ scale: currentStep >= step.number ? 1.1 : 1 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: currentStep > step.number
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : currentStep === step.number
                      ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                      : '#f1f5f9',
                    color: currentStep >= step.number ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    border: currentStep === step.number ? '3px solid #93c5fd' : 'none',
                    boxShadow: currentStep === step.number ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentStep > step.number ? '✓' : step.icon}
                </motion.div>
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: currentStep >= step.number ? '#0f172a' : '#94a3b8'
                  }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    Step {step.number}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  flex: 0.5,
                  height: 3,
                  background: currentStep > step.number
                    ? 'linear-gradient(90deg, #10b981, #059669)'
                    : '#e5e7eb',
                  marginBottom: 40,
                  borderRadius: 2,
                  transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            padding: 32,
            marginBottom: 24
          }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    App Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter your app name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Short Summary * (80 characters max)
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={formData.summary}
                    onChange={(e) => updateFormData('summary', e.target.value)}
                    placeholder="Brief description for app store listing"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, textAlign: 'right' }}>
                    {formData.summary.length}/80 characters
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Full Description *
                  </label>
                  <textarea
                    rows={8}
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Detailed description of your app, its features, and what makes it unique..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      marginBottom: 8
                    }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => updateFormData('category', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        outline: 'none',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      marginBottom: 8
                    }}>
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => updateFormData('version', e.target.value)}
                    placeholder="1.0.0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Technical Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
              >
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    Target Devices *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {DEVICES.map(device => (
                      <label
                        key={device}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 16,
                          borderRadius: 10,
                          border: formData.targetDevices.includes(device) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                          background: formData.targetDevices.includes(device) ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.targetDevices.includes(device)}
                          onChange={() => toggleArrayField('targetDevices', device)}
                          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{device}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    Required Permissions
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {PERMISSIONS.map(permission => (
                      <label
                        key={permission}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: 12,
                          borderRadius: 8,
                          border: formData.permissions.includes(permission) ? '2px solid #10b981' : '1px solid #e5e7eb',
                          background: formData.permissions.includes(permission) ? '#f0fdf4' : 'white',
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => toggleArrayField('permissions', permission)}
                          style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Minimum API Level
                  </label>
                  <input
                    type="number"
                    min={23}
                    max={35}
                    value={formData.minApiLevel}
                    onChange={(e) => updateFormData('minApiLevel', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                    Quest typically requires API level ≥ 29
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      marginBottom: 8
                    }}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                      placeholder="https://yourapp.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0f172a',
                      marginBottom: 8
                    }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => updateFormData('supportEmail', e.target.value)}
                      placeholder="support@yourapp.com"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Privacy Policy URL
                  </label>
                  <input
                    type="url"
                    value={formData.privacyPolicyUrl}
                    onChange={(e) => updateFormData('privacyPolicyUrl', e.target.value)}
                    placeholder="https://yourapp.com/privacy"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Upload Assets */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
              >
                {/* APK Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    APK File * (Max 1 GB)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => apkInputRef.current?.click()}
                    style={{
                      border: isDragging ? '3px dashed #2563eb' : '2px dashed #e5e7eb',
                      borderRadius: 16,
                      padding: 48,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? '#eff6ff' : apkFile ? '#f8fafc' : 'white',
                      transition: 'all 0.3s'
                    }}
                  >
                    {!apkFile ? (
                      <>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                          Drop your APK file here or click to browse
                        </div>
                        <div style={{ fontSize: 14, color: '#64748b' }}>
                          Supports .apk files up to 1 GB
                        </div>
                      </>
                    ) : (
                      <div>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>
                          {apkFile.status === 'completed' ? '✓' : apkFile.status === 'error' ? '❌' : '⏳'}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                          {apkFile.file.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                          {(apkFile.file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        {apkFile.status === 'uploading' && (
                          <div style={{ maxWidth: 400, margin: '0 auto' }}>
                            <div style={{
                              height: 8,
                              background: '#e5e7eb',
                              borderRadius: 999,
                              overflow: 'hidden'
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${apkFile.progress}%` }}
                                style={{
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                                  borderRadius: 999
                                }}
                              />
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                              Uploading... {apkFile.progress}%
                            </div>
                          </div>
                        )}
                        {apkFile.status === 'completed' && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 16px',
                            background: '#dcfce7',
                            color: '#166534',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 600
                          }}>
                            ✓ Upload completed
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    ref={apkInputRef}
                    type="file"
                    accept=".apk"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'apk');
                    }}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Icon Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    App Icon * (512×512 px, PNG or JPG)
                  </label>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {iconFile?.preview && (
                      <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: 20,
                        background: `url(${iconFile.preview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '2px solid #e5e7eb'
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'icon');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer'
                        }}
                      />
                      {iconFile && iconFile.status === 'uploading' && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{
                            height: 6,
                            background: '#e5e7eb',
                            borderRadius: 999,
                            overflow: 'hidden'
                          }}>
                            <motion.div
                              animate={{ width: `${iconFile.progress}%` }}
                              style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                borderRadius: 999
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Screenshots Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    Screenshots * (At least 3, max 10)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 12,
                    marginBottom: 12
                  }}>
                    {screenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          aspectRatio: '16/9',
                          borderRadius: 12,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb'
                        }}
                      >
                        {screenshot.preview && (
                          <img
                            src={screenshot.preview}
                            alt={`Screenshot ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {screenshot.status === 'uploading' && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: '#e5e7eb'
                          }}>
                            <motion.div
                              animate={{ width: `${screenshot.progress}%` }}
                              style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #8b5cf6, #6366f1)'
                              }}
                            />
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setScreenshots(prev => prev.filter((_, i) => i !== index))}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 700
                          }}
                        >
                          ×
                        </motion.button>
                      </div>
                    ))}
                    {screenshots.length < 10 && (
                      <label style={{
                        aspectRatio: '16/9',
                        border: '2px dashed #e5e7eb',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'white',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 32, marginBottom: 4 }}>+</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Add screenshot</div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => handleFileUpload(file, 'screenshot'));
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {screenshots.length}/10 screenshots uploaded
                  </div>
                </div>

                {/* Hero Image (Optional) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    Hero Banner (Optional, 1920×1080 px)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'hero');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Trailer Video (Optional) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: 12
                  }}>
                    Trailer Video (Optional, MP4, max 100 MB)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'trailer');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Review Your Submission</h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 16
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>App Name</div>
                      <div style={{ fontWeight: 600 }}>{formData.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Category</div>
                      <div style={{ fontWeight: 600 }}>{formData.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Version</div>
                      <div style={{ fontWeight: 600 }}>{formData.version}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Price</div>
                      <div style={{ fontWeight: 600 }}>${formData.price.toFixed(2)}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Target Devices</div>
                      <div style={{ fontWeight: 600 }}>{formData.targetDevices.join(', ')}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Summary</div>
                      <div style={{ fontWeight: 600 }}>{formData.summary}</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #93c5fd',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 24
                }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', marginBottom: 12 }}>
                    📋 What happens next?
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#1e3a8a', lineHeight: 1.8 }}>
                    <li>Your app will be submitted for review</li>
                    <li>Our team will test it for technical compliance</li>
                    <li>Content review typically takes 3-5 business days</li>
                    <li>You'll receive email updates on your app's status</li>
                    <li>Once approved, your app will be published automatically</li>
                  </ul>
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    required
                    style={{ width: 20, height: 20, cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <span style={{ fontSize: 14, color: '#0f172a' }}>
                    I agree to the <strong>Developer Terms & Conditions</strong> and <strong>Content Guidelines</strong>
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24
          }}
        >
          <motion.button
            whileHover={{ scale: currentStep > 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentStep > 1 ? 0.95 : 1 }}
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: currentStep > 1 ? 'pointer' : 'not-allowed',
              opacity: currentStep === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            ← Back
          </motion.button>

          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save as Draft
            </motion.button>

            {currentStep < 4 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!validateStep(currentStep)}
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: 'none',
                  background: validateStep(currentStep)
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : '#e5e7eb',
                  color: validateStep(currentStep) ? 'white' : '#94a3b8',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: validateStep(currentStep) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: validateStep(currentStep) ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                Continue →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                disabled={loading}
                onClick={handleSubmit}
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: 'none',
                  background: loading
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: loading ? '#94a3b8' : 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid #94a3b8',
                        borderTopColor: 'transparent',
                        borderRadius: '50%'
                      }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>✓ Submit for Review</>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}