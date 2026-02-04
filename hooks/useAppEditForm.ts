'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppFormData } from '@/types/app-submission';

// Extended form data that includes server URLs for existing files
export interface AppEditFormData extends Omit<AppFormData, 'apkFile' | 'iconFile' | 'screenshots' | 'heroImageFile'> {
    // Server URLs for existing files
    iconUrl: string;
    heroImageUrl: string | null;
    screenshotUrls: string[];
    apkUrl: string;
    trailerVideoUrl: string | null;

    // New files to upload (optional)
    iconFile: File | null;
    heroImageFile: File | null;
    newScreenshots: File[];
    trailerVideoFile: File | null;

    // Meta
    status: string;
    lastUpdated: string;
}

const INITIAL_EDIT_DATA: AppEditFormData = {
    name: '',
    slug: '',
    summary: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    price: 0,
    currency: 'USD',
    salePrice: null,
    saleEndDate: null,
    version: '1.0.0',
    minApiLevel: 29,
    targetDevices: [],
    permissions: [],
    sizeBytes: 0,
    requiresHandTracking: false,
    requiresPassthrough: false,
    requiresControllers: true,
    iconUrl: '',
    heroImageUrl: null,
    screenshotUrls: [],
    apkUrl: '',
    iconFile: null,
    heroImageFile: null,
    newScreenshots: [],
    trailerUrl: '',
    trailerVideoUrl: null,
    trailerVideoFile: null,
    promoVideoUrl: '',
    contentRating: 'EVERYONE',
    comfortLevel: 'COMFORTABLE',
    playArea: 'STANDING',
    playerModes: ['SINGLE_PLAYER'],
    estimatedPlayTime: '',
    ageRating: '',
    containsAds: false,
    hasInAppPurchases: false,
    inAppPurchaseInfo: '',
    features: [],
    whatsNew: '',
    languages: ['en'],
    privacyPolicyUrl: '',
    supportUrl: '',
    supportEmail: '',
    discordUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
    developerNotes: '',
    credits: '',
    acknowledgments: '',
    status: 'DRAFT',
    lastUpdated: '',
};

export function useAppEditForm(appId: string) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AppEditFormData>(INITIAL_EDIT_DATA);
    const [originalData, setOriginalData] = useState<AppEditFormData>(INITIAL_EDIT_DATA);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('store');
    const [newTag, setNewTag] = useState('');
    const [newFeature, setNewFeature] = useState('');

    // Fetch app data on mount
    useEffect(() => {
        const fetchApp = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/developer/apps/${appId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch app');
                }

                // Map server data to form data
                const mappedData: AppEditFormData = {
                    name: data.name || '',
                    slug: data.slug || '',
                    summary: data.summary || '',
                    description: data.description || '',
                    category: data.category || '',
                    subcategory: data.subcategory || '',
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    price: data.price || 0,
                    currency: data.currency || 'USD',
                    salePrice: data.salePrice,
                    saleEndDate: data.saleEndDate,
                    version: data.version || '1.0.0',
                    minApiLevel: data.minApiLevel || 29,
                    targetDevices: Array.isArray(data.targetDevices) ? data.targetDevices : [],
                    permissions: Array.isArray(data.permissions) ? data.permissions : [],
                    sizeBytes: data.sizeBytes || 0,
                    requiresHandTracking: data.requiresHandTracking || false,
                    requiresPassthrough: data.requiresPassthrough || false,
                    requiresControllers: data.requiresControllers ?? true,
                    iconUrl: data.iconUrl || '',
                    heroImageUrl: data.heroImageUrl,
                    screenshotUrls: Array.isArray(data.screenshots) ? data.screenshots : [],
                    apkUrl: data.apkUrl || '',
                    iconFile: null,
                    heroImageFile: null,
                    newScreenshots: [],
                    trailerUrl: data.trailerUrl || '',
                    trailerVideoUrl: data.trailerVideoUrl || null,
                    trailerVideoFile: null,
                    promoVideoUrl: data.promoVideoUrl || '',
                    contentRating: data.contentRating || 'EVERYONE',
                    comfortLevel: data.comfortLevel || 'COMFORTABLE',
                    playArea: data.playArea || 'STANDING',
                    playerModes: Array.isArray(data.playerModes) ? data.playerModes : ['SINGLE_PLAYER'],
                    estimatedPlayTime: data.estimatedPlayTime || '',
                    ageRating: data.ageRating || '',
                    containsAds: data.containsAds || false,
                    hasInAppPurchases: data.hasInAppPurchases || false,
                    inAppPurchaseInfo: data.inAppPurchaseInfo || '',
                    features: Array.isArray(data.features) ? data.features : [],
                    whatsNew: data.whatsNew || '',
                    languages: Array.isArray(data.languages) ? data.languages : ['en'],
                    privacyPolicyUrl: data.privacyPolicyUrl || '',
                    supportUrl: data.supportUrl || '',
                    supportEmail: data.supportEmail || '',
                    discordUrl: data.discordUrl || '',
                    twitterUrl: data.twitterUrl || '',
                    youtubeUrl: data.youtubeUrl || '',
                    developerNotes: data.developerNotes || '',
                    credits: data.credits || '',
                    acknowledgments: data.acknowledgments || '',
                    status: data.status || 'DRAFT',
                    lastUpdated: data.lastUpdated || '',
                };

                setFormData(mappedData);
                setOriginalData(mappedData);
            } catch (err: any) {
                setError(err.message || 'Failed to load app');
            } finally {
                setLoading(false);
            }
        };

        if (appId) {
            fetchApp();
        }
    }, [appId]);

    // Update field
    const updateField = useCallback(<K extends keyof AppEditFormData>(field: K, value: AppEditFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (prev[field as string]) {
                const { [field as string]: _, ...rest } = prev;
                return rest;
            }
            return prev;
        });
    }, []);

    // File handlers
    const handleIconChange = useCallback((file: File | null) => {
        updateField('iconFile', file);
    }, [updateField]);

    const handleHeroImageChange = useCallback((file: File | null) => {
        updateField('heroImageFile', file);
    }, [updateField]);

    const handleTrailerVideoChange = useCallback((file: File | null) => {
        updateField('trailerVideoFile', file);
    }, [updateField]);

    const handleNewScreenshots = useCallback((files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                newScreenshots: [...prev.newScreenshots, ...newFiles].slice(0, 10 - prev.screenshotUrls.length)
            }));
        }
    }, []);

    const removeExistingScreenshot = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            screenshotUrls: prev.screenshotUrls.filter((_, i) => i !== index)
        }));
    }, []);

    const removeNewScreenshot = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            newScreenshots: prev.newScreenshots.filter((_, i) => i !== index)
        }));
    }, []);

    // Tag management
    const addTag = useCallback(() => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
            updateField('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    }, [newTag, formData.tags, updateField]);

    const removeTag = useCallback((tag: string) => {
        updateField('tags', formData.tags.filter(t => t !== tag));
    }, [formData.tags, updateField]);

    // Feature management
    const addFeature = useCallback(() => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            updateField('features', [...formData.features, newFeature.trim()]);
            setNewFeature('');
        }
    }, [newFeature, formData.features, updateField]);

    const toggleFeature = useCallback((feature: string) => {
        if (formData.features.includes(feature)) {
            updateField('features', formData.features.filter(f => f !== feature));
        } else {
            updateField('features', [...formData.features, feature]);
        }
    }, [formData.features, updateField]);

    const removeFeature = useCallback((feature: string) => {
        updateField('features', formData.features.filter(f => f !== feature));
    }, [formData.features, updateField]);

    // Validation
    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'App name is required';
        if (!formData.summary.trim()) newErrors.summary = 'Summary is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (formData.targetDevices.length === 0) newErrors.targetDevices = 'Select at least one device';
        if (formData.playerModes.length === 0) newErrors.playerModes = 'Select at least one player mode';
        if (formData.languages.length === 0) newErrors.languages = 'Select at least one language';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Check if form has changes
    const hasChanges = useCallback((): boolean => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    // Save changes
    const handleSave = useCallback(async () => {
        if (!validate()) {
            return false;
        }

        setSaving(true);
        setError(null);

        try {
            const formDataToSend = new FormData();

            // Add all text/array fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('slug', formData.slug);
            formDataToSend.append('summary', formData.summary);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('subcategory', formData.subcategory || '');
            formDataToSend.append('tags', JSON.stringify(formData.tags));
            formDataToSend.append('price', String(formData.price));
            formDataToSend.append('currency', formData.currency);
            if (formData.salePrice !== null) {
                formDataToSend.append('salePrice', String(formData.salePrice));
            }
            formDataToSend.append('minApiLevel', String(formData.minApiLevel));
            formDataToSend.append('targetDevices', JSON.stringify(formData.targetDevices));
            formDataToSend.append('permissions', JSON.stringify(formData.permissions));
            formDataToSend.append('requiresHandTracking', String(formData.requiresHandTracking));
            formDataToSend.append('requiresPassthrough', String(formData.requiresPassthrough));
            formDataToSend.append('requiresControllers', String(formData.requiresControllers));
            formDataToSend.append('contentRating', formData.contentRating);
            formDataToSend.append('comfortLevel', formData.comfortLevel);
            formDataToSend.append('playArea', formData.playArea);
            formDataToSend.append('playerModes', JSON.stringify(formData.playerModes));
            formDataToSend.append('containsAds', String(formData.containsAds));
            formDataToSend.append('hasInAppPurchases', String(formData.hasInAppPurchases));
            formDataToSend.append('inAppPurchaseInfo', formData.inAppPurchaseInfo || '');
            formDataToSend.append('features', JSON.stringify(formData.features));
            formDataToSend.append('whatsNew', formData.whatsNew || '');
            formDataToSend.append('languages', JSON.stringify(formData.languages));
            formDataToSend.append('privacyPolicyUrl', formData.privacyPolicyUrl || '');
            formDataToSend.append('supportUrl', formData.supportUrl || '');
            formDataToSend.append('supportEmail', formData.supportEmail || '');
            formDataToSend.append('discordUrl', formData.discordUrl || '');
            formDataToSend.append('twitterUrl', formData.twitterUrl || '');
            formDataToSend.append('youtubeUrl', formData.youtubeUrl || '');
            formDataToSend.append('trailerUrl', formData.trailerUrl || '');
            formDataToSend.append('trailerVideoUrl', formData.trailerVideoUrl || '');
            formDataToSend.append('promoVideoUrl', formData.promoVideoUrl || '');
            formDataToSend.append('estimatedPlayTime', formData.estimatedPlayTime || '');
            formDataToSend.append('ageRating', formData.ageRating || '');
            formDataToSend.append('developerNotes', formData.developerNotes || '');
            formDataToSend.append('credits', formData.credits || '');
            formDataToSend.append('acknowledgments', formData.acknowledgments || '');

            // Existing screenshots (URLs to keep)
            formDataToSend.append('existingScreenshots', JSON.stringify(formData.screenshotUrls));

            // New file uploads
            if (formData.iconFile) {
                formDataToSend.append('iconFile', formData.iconFile);
            }
            if (formData.heroImageFile) {
                formDataToSend.append('heroImageFile', formData.heroImageFile);
            }
            if (formData.trailerVideoFile) {
                formDataToSend.append('trailerVideoFile', formData.trailerVideoFile);
            }
            formData.newScreenshots.forEach((file, index) => {
                formDataToSend.append(`screenshot_${index}`, file);
            });

            const response = await fetch(`/api/developer/apps/${appId}`, {
                method: 'PATCH',
                body: formDataToSend,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save changes');
            }

            // Update original data to reflect saved state
            setOriginalData({ ...formData });

            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to save changes');
            return false;
        } finally {
            setSaving(false);
        }
    }, [appId, formData, validate]);

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    return {
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
        validate,
        hasChanges,
        handleSave,
        formatFileSize,
    };
}
