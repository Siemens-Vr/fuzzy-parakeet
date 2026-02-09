'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAppEditForm } from '@/hooks/useAppEditForm';
import {
    CATEGORIES,
    TARGET_DEVICES,
    PERMISSIONS,
    CONTENT_RATINGS,
    COMFORT_LEVELS,
    PLAY_AREAS,
    PLAYER_MODES,
    CURRENCIES,
    LANGUAGES,
    COMMON_FEATURES,
    API_LEVELS,
} from '@/lib/app-submission-constants';

const TABS = [
    { id: 'store', label: 'Store Listing', icon: '🏪' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'content', label: 'Content & Comfort', icon: '🎮' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'support', label: 'Support & Links', icon: '🔗' },
];

export default function EditAppPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const {
        loading,
        saving,
        error,
        formData,
        errors,
        activeTab,
        setActiveTab,
        newTag,
        setNewTag,
        newFeature,
        setNewFeature,
        updateField,
        handleIconChange,
        handleHeroImageChange,
        handleTrailerVideoChange,
        handleNewScreenshots,
        removeExistingScreenshot,
        removeNewScreenshot,
        addTag,
        removeTag,
        addFeature,
        toggleFeature,
        removeFeature,
        hasChanges,
        handleSave,
        formatFileSize,
    } = useAppEditForm(id);

    if (loading) {
        return (
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{
                    width: 50, height: 50, margin: '0 auto 16px',
                    border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#7c3aed',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
                <div className="text-secondary">Loading app data...</div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>
                    Unable to load app
                </h2>
                <p className="text-secondary" style={{ marginBottom: 24 }}>{error}</p>
                <Link href="/developer" className="btn btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const renderStoreTab = () => (
        <div className="space-y-6">
            {/* App Icon & Name */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div>
                    <label className="label">App Icon</label>
                    <div style={{
                        width: 120, height: 120,
                        borderRadius: 16,
                        border: '2px dashed var(--border-medium)',
                        overflow: 'hidden',
                        position: 'relative',
                        background: 'var(--bg-secondary)'
                    }}>
                        {(formData.iconFile || formData.iconUrl) ? (
                            <img
                                src={formData.iconFile ? URL.createObjectURL(formData.iconFile) : formData.iconUrl}
                                alt="App icon"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{
                                height: '100%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 32
                            }}>
                                🖼️
                            </div>
                        )}
                        <label style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.5)', opacity: 0,
                            cursor: 'pointer', color: '#fff', fontSize: 12,
                            transition: 'opacity 0.2s'
                        }} className="hover-show">
                            Change
                            <input
                                type="file"
                                accept="image/png"
                                onChange={(e) => handleIconChange(e.target.files?.[0] || null)}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label className="label">
                            App Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className={`input ${errors.name ? 'border-red-500' : ''}`}
                            maxLength={50}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="label">URL Slug</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{
                                background: 'var(--bg-active)', padding: '8px 12px',
                                border: '1px solid var(--border-medium)', borderRight: 'none',
                                borderRadius: '8px 0 0 8px', color: 'var(--text-secondary)', fontSize: 14
                            }}>
                                /app/
                            </span>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                className="input"
                                style={{ borderRadius: '0 8px 8px 0' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <label className="label">
                    Short Description <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => updateField('summary', e.target.value)}
                    className={`input ${errors.summary ? 'border-red-500' : ''}`}
                    placeholder="A brief, catchy description"
                    maxLength={150}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {errors.summary && <p className="text-red-500 text-sm">{errors.summary}</p>}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {formData.summary.length}/150
                    </span>
                </div>
            </div>

            {/* Hero Image */}
            <div>
                <label className="label">Hero Image (Cover Art)</label>
                <div style={{
                    width: '100%', aspectRatio: '2/1', maxWidth: 600,
                    borderRadius: 16, border: '2px dashed var(--border-medium)',
                    overflow: 'hidden', position: 'relative',
                    background: 'var(--bg-secondary)'
                }}>
                    {(formData.heroImageFile || formData.heroImageUrl) ? (
                        <img
                            src={formData.heroImageFile ? URL.createObjectURL(formData.heroImageFile) : (formData.heroImageUrl || '')}
                            alt="Hero image"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'
                        }}>
                            <span style={{ fontSize: 48 }}>🌄</span>
                            <span style={{ marginTop: 12 }}>Upload Cover Art (2:1 ratio)</span>
                        </div>
                    )}
                    <label style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)', opacity: 0,
                        cursor: 'pointer', color: '#fff', fontSize: 14,
                        transition: 'opacity 0.2s'
                    }} className="hover-show">
                        Change Cover Art
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeroImageChange(e.target.files?.[0] || null)}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="label">
                    Full Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className={`input ${errors.description ? 'border-red-500' : ''}`}
                    style={{ minHeight: 150 }}
                    placeholder="Describe your app in detail..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Video URLs - Moved from Support Tab */}
            <div className="card" style={{ padding: 16, background: 'var(--bg-active)' }}>
                <label className="label">Videos</label>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-secondary mb-1">Trailer URL</label>
                        <input
                            type="url"
                            value={formData.trailerUrl}
                            onChange={(e) => updateField('trailerUrl', e.target.value)}
                            className="input"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Trailer Video File (Upload)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                flex: 1,
                                height: 44,
                                border: '1px solid var(--border-medium)',
                                borderRadius: 8,
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <span style={{ fontSize: 13, color: (formData.trailerVideoFile || formData.trailerVideoUrl) ? 'var(--text-primary)' : 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {formData.trailerVideoFile
                                        ? formData.trailerVideoFile.name
                                        : (formData.trailerVideoUrl ? 'Video Uploaded ✓' : 'Support MP4, WebM (Max 50MB)')}
                                </span>
                                <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={(e) => handleTrailerVideoChange(e.target.files?.[0] || null)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                            {formData.trailerVideoFile && (
                                <button
                                    type="button"
                                    onClick={() => handleTrailerVideoChange(null)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 12px', height: 44 }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Promo Video URL</label>
                        <input
                            type="url"
                            value={formData.promoVideoUrl}
                            onChange={(e) => updateField('promoVideoUrl', e.target.value)}
                            className="input"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>
                </div>
            </div>

            {/* Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label className="label">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => {
                            updateField('category', e.target.value);
                            updateField('subcategory', '');
                        }}
                        className={`select ${errors.category ? 'border-red-500' : ''}`}
                    >
                        <option value="">Select category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                    <label className="label">Subcategory</label>
                    <select
                        value={formData.subcategory}
                        onChange={(e) => updateField('subcategory', e.target.value)}
                        className="select"
                        disabled={!formData.category}
                    >
                        <option value="">Select subcategory</option>
                        {CATEGORIES.find(c => c.value === formData.category)?.subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="label">Tags (up to 10)</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="input"
                        placeholder="Add tag..."
                        style={{ flex: 1 }}
                    />
                    <button type="button" onClick={addTag} className="btn btn-outline">Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {formData.tags.map(tag => (
                        <span key={tag} className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: 4 }}>×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Screenshots */}
            <div>
                <label className="label">
                    Screenshots ({formData.screenshotUrls.length + formData.newScreenshots.length}/10)
                </label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12
                }}>
                    {/* Existing screenshots */}
                    {formData.screenshotUrls.map((url, index) => (
                        <div key={`existing-${index}`} style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}>
                            <img src={url} alt={`Screenshot ${index + 1}`} style={{
                                width: '100%', height: '100%', objectFit: 'cover'
                            }} />
                            <button
                                type="button"
                                onClick={() => removeExistingScreenshot(index)}
                                style={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: '#ef4444', color: '#fff', border: 'none',
                                    cursor: 'pointer', fontSize: 14
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* New screenshots */}
                    {formData.newScreenshots.map((file, index) => (
                        <div key={`new-${index}`} style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: '2px solid #3b82f6'
                        }}>
                            <img src={URL.createObjectURL(file)} alt={`New screenshot ${index + 1}`} style={{
                                width: '100%', height: '100%', objectFit: 'cover'
                            }} />
                            <button
                                type="button"
                                onClick={() => removeNewScreenshot(index)}
                                style={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: '#ef4444', color: '#fff', border: 'none',
                                    cursor: 'pointer', fontSize: 14
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Add more button */}
                    {(formData.screenshotUrls.length + formData.newScreenshots.length) < 10 && (
                        <label style={{
                            aspectRatio: '16/9',
                            border: '2px dashed var(--border-medium)',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: 'var(--bg-secondary)',
                            flexDirection: 'column',
                            gap: 4
                        }}>
                            <span style={{ fontSize: 24 }}>+</span>
                            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Add</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleNewScreenshots(e.target.files)}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );

    const renderPricingTab = () => (
        <div className="space-y-6">
            <div>
                <label className="label">Pricing Model</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                        type="button"
                        onClick={() => updateField('price', 0)}
                        className={`card ${formData.price === 0 ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ padding: 16, textAlign: 'left' }}
                    >
                        <div style={{ fontWeight: 600 }}>Free</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Available at no cost</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => formData.price === 0 && updateField('price', 4.99)}
                        className={`card ${formData.price > 0 ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ padding: 16, textAlign: 'left' }}
                    >
                        <div style={{ fontWeight: 600 }}>Paid</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Set a price</div>
                    </button>
                </div>
            </div>

            {formData.price > 0 && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label className="label">Currency</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => updateField('currency', e.target.value)}
                                className="select"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                className="input"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 16, background: 'var(--blue-light)' }}>
                        <div className="text-primary" style={{ fontWeight: 600, marginBottom: 4 }}>Revenue Split</div>
                        <p style={{ fontSize: 14, color: 'var(--blue-primary)' }}>
                            You receive <strong>70%</strong> of each sale (
                            {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                            {(formData.price * 0.7).toFixed(2)} per sale)
                        </p>
                    </div>
                </>
            )}
        </div>
    );

    const renderTechnicalTab = () => (
        <div className="space-y-6">
            <div className="card" style={{ padding: 16, background: 'var(--green-light)', border: '1px solid var(--green)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>📦</span>
                    <div>
                        <div className="text-primary" style={{ fontWeight: 600 }}>Current APK</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            Version {formData.version} • {formatFileSize(formData.sizeBytes)}
                        </div>
                    </div>
                    <Link
                        href={`/developer/apps/${id}/releases`}
                        className="btn btn-outline"
                        style={{ marginLeft: 'auto' }}
                    >
                        Manage Builds
                    </Link>
                </div>
            </div>

            <div>
                <label className="label">Minimum API Level</label>
                <select
                    value={formData.minApiLevel}
                    onChange={(e) => updateField('minApiLevel', parseInt(e.target.value))}
                    className="select"
                >
                    {API_LEVELS.map(api => (
                        <option key={api.value} value={api.value}>{api.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="label">
                    Target Devices <span className="text-red-500">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {TARGET_DEVICES.map(device => (
                        <label
                            key={device.value}
                            className={`card ${formData.targetDevices.includes(device.value) ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.targetDevices.includes(device.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        updateField('targetDevices', [...formData.targetDevices, device.value]);
                                    } else {
                                        updateField('targetDevices', formData.targetDevices.filter(d => d !== device.value));
                                    }
                                }}
                            />
                            <span className="text-primary">{device.label}</span>
                        </label>
                    ))}
                </div>
                {errors.targetDevices && <p className="text-red-500 text-sm mt-1">{errors.targetDevices}</p>}
            </div>

            <div>
                <label className="label">Required Permissions</label>
                <div className="space-y-2">
                    {PERMISSIONS.map(perm => (
                        <label
                            key={perm.value}
                            className={`card ${formData.permissions.includes(perm.value) ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.permissions.includes(perm.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        updateField('permissions', [...formData.permissions, perm.value]);
                                    } else {
                                        updateField('permissions', formData.permissions.filter(p => p !== perm.value));
                                    }
                                }}
                                style={{ marginTop: 2 }}
                            />
                            <div>
                                <div className="text-primary" style={{ fontWeight: 500 }}>{perm.label}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{perm.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="label">Hardware Requirements</label>
                <div className="space-y-2">
                    {[
                        { field: 'requiresControllers' as const, label: 'Requires Controllers' },
                        { field: 'requiresHandTracking' as const, label: 'Requires Hand Tracking' },
                        { field: 'requiresPassthrough' as const, label: 'Requires Passthrough/MR' },
                    ].map(({ field, label }) => (
                        <label key={field} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData[field]}
                                onChange={(e) => updateField(field, e.target.checked)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderContentTab = () => (
        <div className="space-y-6">
            <div>
                <label className="label">Content Rating</label>
                <div className="space-y-2">
                    {CONTENT_RATINGS.map(rating => (
                        <label
                            key={rating.value}
                            className={`card ${formData.contentRating === rating.value ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                        >
                            <input
                                type="radio"
                                name="contentRating"
                                checked={formData.contentRating === rating.value}
                                onChange={() => updateField('contentRating', rating.value)}
                                style={{ marginTop: 2 }}
                            />
                            <div>
                                <div className="text-primary" style={{ fontWeight: 500 }}>{rating.label}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rating.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="label">Comfort Level</label>
                <div className="space-y-2">
                    {COMFORT_LEVELS.map(level => (
                        <label
                            key={level.value}
                            className={`card ${formData.comfortLevel === level.value ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                        >
                            <input
                                type="radio"
                                name="comfortLevel"
                                checked={formData.comfortLevel === level.value}
                                onChange={() => updateField('comfortLevel', level.value)}
                                style={{ marginTop: 2 }}
                            />
                            <div>
                                <div className="text-primary" style={{ fontWeight: 500 }}>{level.label}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{level.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="label">Play Area</label>
                <div className="space-y-2">
                    {PLAY_AREAS.map(area => (
                        <label
                            key={area.value}
                            className={`card ${formData.playArea === area.value ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                        >
                            <input
                                type="radio"
                                name="playArea"
                                checked={formData.playArea === area.value}
                                onChange={() => updateField('playArea', area.value)}
                                style={{ marginTop: 2 }}
                            />
                            <div>
                                <div className="text-primary" style={{ fontWeight: 500 }}>{area.label}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{area.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="label">Player Modes</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {PLAYER_MODES.map(mode => (
                        <label
                            key={mode.value}
                            className={`card ${formData.playerModes.includes(mode.value) ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.playerModes.includes(mode.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        updateField('playerModes', [...formData.playerModes, mode.value]);
                                    } else {
                                        updateField('playerModes', formData.playerModes.filter(m => m !== mode.value));
                                    }
                                }}
                            />
                            <span>{mode.label}</span>
                        </label>
                    ))}
                </div>
                {errors.playerModes && <p className="text-red-500 text-sm mt-1">{errors.playerModes}</p>}
            </div>

            <div className="card" style={{ padding: 16 }}>
                <label className="label">Monetization</label>
                <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={formData.containsAds}
                            onChange={(e) => updateField('containsAds', e.target.checked)}
                        />
                        <span>Contains advertisements</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={formData.hasInAppPurchases}
                            onChange={(e) => updateField('hasInAppPurchases', e.target.checked)}
                        />
                        <span>Has in-app purchases</span>
                    </label>
                    {formData.hasInAppPurchases && (
                        <textarea
                            value={formData.inAppPurchaseInfo}
                            onChange={(e) => updateField('inAppPurchaseInfo', e.target.value)}
                            className="input"
                            placeholder="Describe in-app purchases..."
                            style={{ marginTop: 8 }}
                            rows={2}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    const renderFeaturesTab = () => (
        <div className="space-y-6">
            <div>
                <label className="label">Features</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                    {COMMON_FEATURES.map(feature => (
                        <label
                            key={feature}
                            className={`card ${formData.features.includes(feature) ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.features.includes(feature)}
                                onChange={() => toggleFeature(feature)}
                            />
                            <span className="text-primary">{feature}</span>
                        </label>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="input"
                        placeholder="Add custom feature..."
                        style={{ flex: 1 }}
                    />
                    <button type="button" onClick={addFeature} className="btn btn-outline">Add</button>
                </div>

                {formData.features.filter(f => !COMMON_FEATURES.includes(f)).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        {formData.features.filter(f => !COMMON_FEATURES.includes(f)).map(feature => (
                            <span key={feature} className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {feature}
                                <button type="button" onClick={() => removeFeature(feature)} className="hover:text-primary">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label className="label">What&apos;s New</label>
                <textarea
                    value={formData.whatsNew}
                    onChange={(e) => updateField('whatsNew', e.target.value)}
                    className="input"
                    placeholder="Describe what's new in this version..."
                    rows={4}
                />
            </div>

            <div>
                <label className="label">
                    Supported Languages <span className="text-red-500">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {LANGUAGES.map(lang => (
                        <label
                            key={lang.value}
                            className={`card ${formData.languages.includes(lang.value) ? 'ring-2 ring-blue-500' : ''}`}
                            style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                        >
                            <input
                                type="checkbox"
                                checked={formData.languages.includes(lang.value)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        updateField('languages', [...formData.languages, lang.value]);
                                    } else {
                                        updateField('languages', formData.languages.filter(l => l !== lang.value));
                                    }
                                }}
                            />
                            <span className="text-primary">{lang.label}</span>
                        </label>
                    ))}
                </div>
                {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
            </div>
        </div>
    );

    const renderSupportTab = () => (
        <div className="space-y-6">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label className="label">Support Email</label>
                    <input
                        type="email"
                        value={formData.supportEmail}
                        onChange={(e) => updateField('supportEmail', e.target.value)}
                        className="input"
                        placeholder="support@example.com"
                    />
                </div>
                <div>
                    <label className="label">Support Website</label>
                    <input
                        type="url"
                        value={formData.supportUrl}
                        onChange={(e) => updateField('supportUrl', e.target.value)}
                        className="input"
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div>
                <label className="label">Privacy Policy URL</label>
                <input
                    type="url"
                    value={formData.privacyPolicyUrl}
                    onChange={(e) => updateField('privacyPolicyUrl', e.target.value)}
                    className="input"
                    placeholder="https://..."
                />
            </div>

            <div>
                <label className="label">Social Links</label>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-secondary mb-1">Discord</label>
                        <input
                            type="url"
                            value={formData.discordUrl}
                            onChange={(e) => updateField('discordUrl', e.target.value)}
                            className="input"
                            placeholder="https://discord.gg/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Twitter/X</label>
                        <input
                            type="url"
                            value={formData.twitterUrl}
                            onChange={(e) => updateField('twitterUrl', e.target.value)}
                            className="input"
                            placeholder="https://twitter.com/..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">YouTube</label>
                        <input
                            type="url"
                            value={formData.youtubeUrl}
                            onChange={(e) => updateField('youtubeUrl', e.target.value)}
                            className="input"
                            placeholder="https://youtube.com/@..."
                        />
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 16 }}>
                <label className="label">Additional Information</label>
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-secondary mb-1">Developer Notes (not public)</label>
                        <textarea
                            value={formData.developerNotes}
                            onChange={(e) => updateField('developerNotes', e.target.value)}
                            className="input"
                            placeholder="Notes for the review team..."
                            rows={2}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-secondary mb-1">Credits</label>
                        <textarea
                            value={formData.credits}
                            onChange={(e) => updateField('credits', e.target.value)}
                            className="input"
                            placeholder="Credit team members, artists..."
                            rows={2}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'store': return renderStoreTab();
            case 'pricing': return renderPricingTab();
            case 'technical': return renderTechnicalTab();
            case 'content': return renderContentTab();
            case 'features': return renderFeaturesTab();
            case 'support': return renderSupportTab();
            default: return renderStoreTab();
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Link href="/developer" style={{ color: 'var(--text-secondary)' }}>Dashboard</Link>
                        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                        <span className="text-primary" style={{ fontWeight: 600 }}>{formData.name || 'Edit App'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`badge badge-${formData.status === 'PUBLISHED' ? 'green' : formData.status === 'IN_REVIEW' ? 'yellow' : 'gray'}`}>
                            {formData.status.replace('_', ' ')}
                        </span>
                        {formData.lastUpdated && (
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Last updated: {new Date(formData.lastUpdated).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/developer" className="btn btn-outline">Cancel</Link>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges()}
                        className="btn btn-primary"
                        style={{ opacity: (saving || !hasChanges()) ? 0.6 : 1 }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="card" style={{
                    padding: 16,
                    marginBottom: 24,
                    background: 'var(--red-light)',
                    border: '1px solid var(--red)'
                }}>
                    <span style={{ color: 'var(--red)' }}>{error}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: 4,
                marginBottom: 24,
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: 0
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 16px',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--bg-active)' : 'transparent',
                            borderBottom: activeTab === tab.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: -1,
                            borderRadius: '8px 8px 0 0'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="card" style={{ padding: 24 }}>
                {renderTabContent()}
            </div>

            {/* Hover style */}
            <style>{`
        .hover-show:hover { opacity: 1 !important; }
        .space-y-6 > * + * { margin-top: 24px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .space-y-2 > * + * { margin-top: 8px; }
      `}</style>
        </div>
    );
}
