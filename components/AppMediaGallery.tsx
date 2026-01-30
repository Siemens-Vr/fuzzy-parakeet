'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppMediaGalleryProps {
    appName: string;
    screenshots: string[];
    trailerUrl?: string | null;
    heroImageUrl?: string | null;
}

export default function AppMediaGallery({
    appName,
    screenshots = [],
    trailerUrl
}: AppMediaGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Combine media items: trailer first if exists, then screenshots
    const mediaItems = [
        ...(trailerUrl ? [{ type: 'video', url: trailerUrl, thumbnail: screenshots[0] || '/placeholder.jpg' }] : []),
        ...screenshots.map(url => ({ type: 'image', url, thumbnail: url }))
    ];

    // Lock body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'Escape':
                    setIsOpen(false);
                    break;
                case 'ArrowLeft':
                    setSelectedIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1));
                    break;
                case 'ArrowRight':
                    setSelectedIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, mediaItems.length]);

    const openOverlay = (index: number) => {
        setSelectedIndex(index);
        setIsOpen(true);
    };

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
        return url; // Fallback or other providers
    };

    return (
        <div className="w-full">
            {/* Thumbnails Row */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {mediaItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => openOverlay(index)}
                        className="group relative flex-shrink-0 w-48 aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-white/50 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        aria-label={`View ${item.type === 'video' ? 'trailer' : `screenshot ${index + 1}`}`}
                    >
                        <img
                            src={item.thumbnail}
                            alt={item.type === 'video' ? `${appName} trailer` : `${appName} screenshot ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Desktop Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                {item.type === 'video' ? (
                                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                                )}
                            </div>
                        </div>

                        {/* Always visible video indicator for video thumbnail */}
                        {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:opacity-0">
                                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-lg"
                        />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-[110] p-2 text-white/70 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md"
                            aria-label="Close gallery"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-7xl px-4 md:px-12 aspect-video max-h-[80vh] z-[105]"
                        >
                            {mediaItems[selectedIndex].type === 'video' ? (
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                                    <iframe
                                        src={getEmbedUrl(mediaItems[selectedIndex].url)}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <img
                                        src={mediaItems[selectedIndex].url}
                                        alt={`${appName} screenshot`}
                                        className="max-w-full max-h-full rounded-lg shadow-2xl select-none"
                                    />
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            {mediaItems.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedIndex(prev => (prev > 0 ? prev - 1 : mediaItems.length - 1));
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedIndex(prev => (prev < mediaItems.length - 1 ? prev + 1 : 0));
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </>
                            )}
                        </motion.div>

                        {/* Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium px-4 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                            {selectedIndex + 1} / {mediaItems.length}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
