'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Lock, Building, DollarSign, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StoreFooter from '@/components/layout/StoreFooter';

// Define the shape of our profile data
// Matches API response from /api/developer/me
interface DeveloperProfile {
    id: string;
    userId: string;
    name: string; // from user
    email: string; // from user
    organizationName: string;
    websiteUrl: string | null;
    bio: string | null;
    logoUrl: string | null;
    socialLinks: {
        discord?: string;
        twitter?: string;
        youtube?: string;
    } | null;
    preferences: {
        timezone?: string;
        notifications?: boolean;
        twoFactor?: boolean;
    } | null;
    isVerified: boolean;
}

export default function DeveloperSettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<DeveloperProfile | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State for Password Change
    const [passForm, setPassForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Fetch data on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/developer/me');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to load profile data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/developer/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organizationName: profile.organizationName,
                    websiteUrl: profile.websiteUrl,
                    bio: profile.bio,
                    logoUrl: profile.logoUrl,
                    socialLinks: profile.socialLinks,
                    preferences: profile.preferences
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Optionally refreshing local user context if needed
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passForm.newPassword !== passForm.confirmNewPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (passForm.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/developer/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passForm.currentPassword,
                    newPassword: passForm.newPassword
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully.' });
                setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to change password.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-app-bg">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-app-bg text-text-primary">
            <div className="container mx-auto px-6 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-text-secondary">Manage your developer profile and account security.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation for Settings */}
                    <div className="lg:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile'
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    : 'text-text-secondary hover:bg-surface-2 hover:text-white'
                                }`}
                        >
                            <Building className="w-5 h-5" />
                            <span className="font-medium">Public Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'account'
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    : 'text-text-secondary hover:bg-surface-2 hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Account</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'security'
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    : 'text-text-secondary hover:bg-surface-2 hover:text-white'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            <span className="font-medium">Security</span>
                        </button>
                        {/* Payouts Link - External */}
                        <a
                            href="/developer/payouts"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-text-secondary hover:bg-surface-2 hover:text-white transition-colors"
                        >
                            <DollarSign className="w-5 h-5" />
                            <span className="font-medium">Payouts</span>
                        </a>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 bg-surface-1 rounded-2xl border border-white/5 p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}
                                >
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span>{message.text}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TAB: PUBLIC PROFILE */}
                        {activeTab === 'profile' && (
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleProfileUpdate}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-4">Public Profile</h2>
                                    <p className="text-sm text-text-secondary mb-6">This information will be displayed on your games and developer page.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Organization Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={profile.organizationName}
                                            onChange={(e) => setProfile({ ...profile, organizationName: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Bio / About</label>
                                        <textarea
                                            rows={4}
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={profile.bio || ''}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Tell players about your studio..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Website URL</label>
                                        <input
                                            type="url"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={profile.websiteUrl || ''}
                                            onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                                            placeholder="https://yourstudio.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Logo URL</label>
                                        <input
                                            type="url"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={profile.logoUrl || ''}
                                            onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                                            placeholder="https://.../logo.png"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Social Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Discord URL"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50"
                                            value={profile.socialLinks?.discord || ''}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                socialLinks: { ...profile.socialLinks, discord: e.target.value }
                                            })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Twitter/X URL"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50"
                                            value={profile.socialLinks?.twitter || ''}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                                            })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="YouTube URL"
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50"
                                            value={profile.socialLinks?.youtube || ''}
                                            onChange={(e) => setProfile({
                                                ...profile,
                                                socialLinks: { ...profile.socialLinks, youtube: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {/* TAB: ACCOUNT */}
                        {activeTab === 'account' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
                                    <p className="text-sm text-text-secondary mb-6">Private information used for administrative purposes.</p>
                                </div>

                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full bg-surface-3/50 border border-white/5 rounded-lg px-4 py-3 text-white/50 cursor-not-allowed"
                                            value={profile.name}
                                        />
                                        <p className="text-xs text-text-muted mt-1">Contact support to update your legal name.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full bg-surface-3/50 border border-white/5 rounded-lg px-4 py-3 text-white/50 cursor-not-allowed"
                                            value={profile.email}
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <label className="flex items-center gap-3 p-4 bg-surface-2 rounded-lg border border-white/10 cursor-pointer hover:border-brand-primary/30 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded bg-surface-3 border-white/20 text-brand-primary focus:ring-brand-primary"
                                                checked={profile.preferences?.notifications !== false} // Default true
                                                onChange={(e) => setProfile({
                                                    ...profile,
                                                    preferences: { ...profile.preferences, notifications: e.target.checked }
                                                })}
                                            />
                                            <div>
                                                <span className="block font-medium text-white">Email Notifications</span>
                                                <span className="text-xs text-text-secondary">Receive updates about your apps and account.</span>
                                            </div>
                                        </label>
                                    </div>
                                    {/* Verification Status Badge */}
                                    <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-lg border border-white/10 mt-6">
                                        <div className={`w-2 h-2 rounded-full ${profile.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                        <div>
                                            <span className="block font-medium text-white">Status: {profile.isVerified ? 'Verified Developer' : 'Unverified'}</span>
                                            {!profile.isVerified && <span className="text-xs text-text-secondary">Submit tax documents to get verified.</span>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        {/* Using same update handler for preferences */}
                                        <button
                                            onClick={handleProfileUpdate}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-6 py-3 bg-surface-3 text-white font-bold rounded-lg hover:bg-surface-3/80 transition-colors disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Preferences'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB: SECURITY */}
                        {activeTab === 'security' && (
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handlePasswordChange}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-4">Security</h2>
                                    <p className="text-sm text-text-secondary mb-6">Manage your password and active sessions.</p>
                                </div>

                                <div className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={passForm.currentPassword}
                                            onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={passForm.newPassword}
                                            onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                        />
                                        <p className="text-xs text-text-muted mt-1">Minimum 8 characters.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary/50 transition-colors"
                                            value={passForm.confirmNewPassword}
                                            onChange={(e) => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                                        </button>

                                        {/* Logout All Sessions Mock Button */}
                                        <button
                                            type="button"
                                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 font-bold rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                                        >
                                            Log out of all other sessions
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        )}

                    </div>
                </div>
            </div>
            <StoreFooter />
        </div>
    );
}
