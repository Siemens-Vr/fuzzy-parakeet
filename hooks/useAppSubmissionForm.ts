'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AppFormData } from '@/types/app-submission';
import { INITIAL_FORM_DATA, STEPS } from '@/lib/app-submission-constants';

export function useAppSubmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AppFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [dragActive, setDragActive] = useState<string | null>(null);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Handle form field changes
  const updateField = useCallback(<K extends keyof AppFormData>(field: K, value: AppFormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
    setErrors(prev => {
      if (prev[field]) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Handle file uploads
  const handleFileChange = useCallback((field: 'apkFile' | 'iconFile' | 'heroImageFile' | 'trailerVideoFile', file: File | null) => {
    updateField(field, file);
    if (field === 'apkFile' && file) {
      updateField('sizeBytes', file.size);
    }
  }, [updateField]);

  const handleScreenshotsChange = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, ...newFiles].slice(0, 8)
      }));
    }
  }, []);

  const removeScreenshot = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(field);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, field: 'apkFile' | 'iconFile' | 'heroImageFile' | 'trailerVideoFile' | 'screenshots') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (field === 'screenshots') {
        handleScreenshotsChange(files);
      } else {
        handleFileChange(field, files[0]);
      }
    }
  }, [handleFileChange, handleScreenshotsChange]);

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
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'App name is required';
        else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
        else if (formData.name.length > 50) newErrors.name = 'Name must be less than 50 characters';

        if (!formData.slug.trim()) newErrors.slug = 'URL slug is required';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';

        if (!formData.summary.trim()) newErrors.summary = 'Short description is required';
        else if (formData.summary.length > 150) newErrors.summary = 'Summary must be less than 150 characters';

        if (!formData.description.trim()) newErrors.description = 'Full description is required';
        else if (formData.description.length < 100) newErrors.description = 'Description must be at least 100 characters';

        if (!formData.category) newErrors.category = 'Category is required';
        break;

      case 2:
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (formData.salePrice !== null && formData.salePrice >= formData.price) {
          newErrors.salePrice = 'Sale price must be less than regular price';
        }
        break;

      case 3:
        if (!formData.version.trim()) newErrors.version = 'Version is required';
        else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) newErrors.version = 'Version must be in format X.Y.Z';

        if (formData.targetDevices.length === 0) newErrors.targetDevices = 'Select at least one target device';
        break;

      case 4:
        if (!formData.apkFile) newErrors.apkFile = 'APK file is required';
        if (!formData.iconFile) newErrors.iconFile = 'App icon is required';
        if (formData.screenshots.length < 3) newErrors.screenshots = 'At least 3 screenshots are required';
        break;

      case 5:
        if (!formData.contentRating) newErrors.contentRating = 'Content rating is required';
        if (!formData.comfortLevel) newErrors.comfortLevel = 'Comfort level is required';
        if (!formData.playArea) newErrors.playArea = 'Play area is required';
        if (formData.playerModes.length === 0) newErrors.playerModes = 'Select at least one player mode';
        break;

      case 6:
        if (formData.languages.length === 0) newErrors.languages = 'Select at least one language';
        break;

      case 7:
        if (formData.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supportEmail)) {
          newErrors.supportEmail = 'Invalid email format';
        }
        if (formData.privacyPolicyUrl && !formData.privacyPolicyUrl.startsWith('http')) {
          newErrors.privacyPolicyUrl = 'Privacy policy URL must start with http:// or https://';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Navigation
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  }, [currentStep, validateStep]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    for (let step = 1; step <= 7; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (Array.isArray(value)) {
          if (key === 'screenshots') {
            value.forEach((file, index) => {
              formDataToSend.append(`screenshot_${index}`, file);
            });
          } else {
            formDataToSend.append(key, JSON.stringify(value));
          }
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch('/api/developer/apps', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit app');
      }

      const result = await response.json();
      router.push(`/developer`);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit app' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router, validateStep]);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    newTag,
    setNewTag,
    newFeature,
    setNewFeature,
    dragActive,
    updateField,
    handleFileChange,
    handleScreenshotsChange,
    removeScreenshot,
    handleDrag,
    handleDrop,
    addTag,
    removeTag,
    addFeature,
    toggleFeature,
    removeFeature,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    formatFileSize,
  };
}