'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

type Build = {
    id: string;
    version: string;
    buildNumber: number;
    uploadedAt: string;
    channel: string;
    isActive: boolean;
    apkUrl: string;
    releaseNotes?: string;
};

export default function ReleasesPage() {
    const params = useParams();
    const [builds, setBuilds] = useState<Build[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    // Form state
    const [newBuild, setNewBuild] = useState({
        version: '',
        buildNumber: '',
        apkUrl: '',
        channel: 'ALPHA',
        releaseNotes: ''
    });

    useEffect(() => {
        fetchBuilds();
    }, [params.id]);

    const fetchBuilds = async () => {
        try {
            const res = await fetch(`/api/developer/apps/${params.id}/builds`);
            if (res.ok) {
                setBuilds(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/developer/apps/${params.id}/builds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBuild)
            });

            if (res.ok) {
                setShowUpload(false);
                fetchBuilds();
                setNewBuild({ version: '', buildNumber: '', apkUrl: '', channel: 'ALPHA', releaseNotes: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Release Management</h1>
                        <p style={{ color: '#64748b', marginTop: 4 }}>Manage your app versions and builds</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Upload New Build
                    </button>
                </div>

                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'white',
                            padding: 24,
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            marginBottom: 24,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 16px 0' }}>Upload New Release</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Version (e.g. 1.0.0)</label>
                                <input
                                    type="text"
                                    required
                                    value={newBuild.version}
                                    onChange={e => setNewBuild({ ...newBuild, version: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Build Number</label>
                                <input
                                    type="number"
                                    required
                                    value={newBuild.buildNumber}
                                    onChange={e => setNewBuild({ ...newBuild, buildNumber: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>APK URL (Temporary)</label>
                                <input
                                    type="url"
                                    required
                                    value={newBuild.apkUrl}
                                    onChange={e => setNewBuild({ ...newBuild, apkUrl: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Channel</label>
                                <select
                                    value={newBuild.channel}
                                    onChange={e => setNewBuild({ ...newBuild, channel: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }}
                                >
                                    <option value="ALPHA">Alpha</option>
                                    <option value="BETA">Beta</option>
                                    <option value="PRODUCTION">Production</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Release Notes</label>
                                <textarea
                                    value={newBuild.releaseNotes}
                                    onChange={e => setNewBuild({ ...newBuild, releaseNotes: e.target.value })}
                                    style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', minHeight: 80 }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'Uploading...' : 'Submit Build'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f1f5f9' }}>
                            <tr>
                                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>VERSION</th>
                                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>CHANNEL</th>
                                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b' }}>STATUS</th>
                                <th style={{ padding: 16, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>DATE</th>
                                <th style={{ padding: 16, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {builds.map((build, i) => (
                                <tr key={build.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: 16 }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{build.version}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>Build {build.buildNumber}</div>
                                    </td>
                                    <td style={{ padding: 16 }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: build.channel === 'PRODUCTION' ? '#dcfce7' : '#f1f5f9',
                                            color: build.channel === 'PRODUCTION' ? '#166534' : '#475569',
                                        }}>
                                            {build.channel}
                                        </span>
                                    </td>
                                    <td style={{ padding: 16 }}>
                                        {build.isActive ? '✅ Active' : 'Inactive'}
                                    </td>
                                    <td style={{ padding: 16, textAlign: 'right', color: '#64748b', fontSize: 14 }}>
                                        {new Date(build.uploadedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: 16, textAlign: 'right' }}>
                                        <button style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            Promote
                                        </button>
                                        <button style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', marginLeft: 12 }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {builds.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                                        No builds found. Upload your first APK.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
