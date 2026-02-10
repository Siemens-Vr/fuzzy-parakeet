'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
    MapPin,
    Link as LinkIcon,
    Twitter,
    Globe,
    MessageCircle,
    Edit3,
    Share2,
    MoreHorizontal,
    CheckCircle2,
    Users,
    Eye,
    Download
} from 'lucide-react';
import AppCard, { AppMeta } from '@/components/AppCard';

export default function DeveloperProfile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('creations');
    const [apps, setApps] = useState<AppMeta[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch developer apps
    useEffect(() => {
        async function fetchApps() {
            try {
                const res = await fetch('/api/developer/apps');
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Map to AppMeta
                    const mapped: AppMeta[] = data.map((app: any) => ({
                        slug: app.slug,
                        name: app.name,
                        version: app.version,
                        summary: app.summary,
                        icon: app.iconUrl,
                        rating: app.rating || 0,
                        downloads: app.downloads,
                        trailerVideoUrl: app.trailerVideoUrl,
                        category: app.category,
                        developer: dev.organizationName,
                        // Add other required fields with defaults
                        filename: '',
                        sizeBytes: 0,
                        sha256: '',
                    }));
                    setApps(mapped);
                }
            } catch (e) {
                console.error('Failed to load apps', e);
            } finally {
                setLoading(false);
            }
        }
        fetchApps();
    }, []);

    if (!user || !user.developer) return null;

    const dev = user.developer;

    return (
        <div className="profile-container">
            {/* ── Header Section ── */}
            <div className="profile-header">
                <div className="profile-banner">
                    {/* Placeholder banner - in real app would be user.developer.bannerUrl */}
                    <div className="profile-banner-overlay" />
                </div>

                <div className="profile-header-content">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {dev.organizationName.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-verified-badge">
                            <CheckCircle2 size={16} fill="var(--blue-primary)" color="white" />
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn btn-secondary btn-sm">
                            <Share2 size={16} />
                            Share
                        </button>
                        <button className="btn btn-primary btn-sm">
                            <Edit3 size={16} />
                            Edit Profile
                        </button>
                        <button className="btn btn-ghost btn-sm icon-only">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                <div className="profile-info">
                    <h1 className="profile-name">
                        {dev.organizationName}
                        {dev.isVerified && (
                            <span className="verified-tag" title="Verified Developer">
                                <CheckCircle2 size={18} fill="var(--blue-primary)" color="white" />
                            </span>
                        )}
                    </h1>
                    <div className="profile-meta">
                        <span className="meta-item">
                            <Globe size={14} />
                            Developed {apps.length} VR Experiences
                        </span>
                        {dev.websiteUrl && (
                            <a href={dev.websiteUrl} target="_blank" rel="noreferrer" className="meta-item link">
                                <LinkIcon size={14} />
                                {new URL(dev.websiteUrl).hostname}
                            </a>
                        )}
                        <span className="meta-item">
                            <MapPin size={14} />
                            {dev.address ? dev.address.split(',')[0] : 'Metaverse'}
                        </span>
                    </div>

                    {/* Bio Placeholder */}
                    <p className="profile-bio">
                        Creating immersive VR experiences for the future. Passionate about bringing new worlds to life on the Meta Quest platform.
                    </p>

                    <div className="profile-stats">
                        <div className="p-stat">
                            <span className="p-stat-value">{apps.reduce((acc, app) => acc + (app.downloads || 0), 0).toLocaleString()}</span>
                            <span className="p-stat-label">Downloads</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-value">{(apps.length * 1250).toLocaleString()}</span>
                            <span className="p-stat-label">Views</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-value">{apps.length}</span>
                            <span className="p-stat-label">Creations</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className="profile-tabs">
                <button
                    className={`p-tab ${activeTab === 'creations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('creations')}
                >
                    Creations
                    <span className="p-tab-count">{apps.length}</span>
                </button>
                <button
                    className={`p-tab ${activeTab === 'community' ? 'active' : ''}`}
                    onClick={() => setActiveTab('community')}
                >
                    Community
                    <span className="p-tab-count">12</span>
                </button>
                <button
                    className={`p-tab ${activeTab === 'about' ? 'active' : ''}`}
                    onClick={() => setActiveTab('about')}
                >
                    About
                </button>
            </div>

            {/* ── Content Area ── */}
            <div className="profile-content">
                {activeTab === 'creations' && (
                    <div className="creations-grid">
                        {loading ? (
                            <div className="loading-state">Loading creations...</div>
                        ) : apps.length > 0 ? (
                            apps.map((app) => (
                                <div key={app.slug} className="creation-card-wrapper">
                                    <AppCard app={app} />
                                    <div className="creation-status">
                                        <span className="status-dot published" /> Published
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-profile-state">
                                <div className="eps-icon"><Download size={48} /></div>
                                <h3>No creations yet</h3>
                                <p>Start building your legacy by publishing your first VR app.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'community' && (
                    <div className="community-feed">
                        <div className="empty-profile-state">
                            <div className="eps-icon"><Users size={48} /></div>
                            <h3>Community Feed</h3>
                            <p>Engage with your fans and post updates about your development journey.</p>
                            <button className="btn btn-outline" style={{ marginTop: 16 }}>Create First Post</button>
                        </div>
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="about-section card">
                        <h2>About {dev.organizationName}</h2>
                        <div className="about-details">
                            <div className="detail-row">
                                <span className="detail-label">Joined</span>
                                <span className="detail-value">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Verification</span>
                                <span className="detail-value status-verified">
                                    <CheckCircle2 size={14} /> Verified Developer
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Support Email</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
