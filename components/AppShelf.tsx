'use client';

import { motion } from 'framer-motion';
import AppCard, { type AppMeta } from '@/components/AppCard';
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';

interface AppShelfProps {
    title: string;
    apps: AppMeta[];
    viewAllHref?: string;
    loading?: boolean;
    leadingItem?: React.ReactNode;
    trailingItem?: React.ReactNode;
}

export default function AppShelf({ title, apps, viewAllHref, loading, leadingItem, trailingItem }: AppShelfProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            // Use 1px threshold for floating point math inconsistencies
            setCanScrollLeft(scrollLeft > 1);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    }, []);

    useEffect(() => {
        updateScrollButtons();
        window.addEventListener('resize', updateScrollButtons);
        return () => window.removeEventListener('resize', updateScrollButtons);
    }, [updateScrollButtons, apps]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 600;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            // Update buttons after smooth scroll completes (approximate)
            setTimeout(updateScrollButtons, 500);
        }
    };

    return (
        <section className="app-shelf-section">
            <div className="shelf-header">
                <h2 className="shelf-title">{title}</h2>
                {viewAllHref && (
                    <Link href={viewAllHref} className="view-all-link">
                        View All <span>→</span>
                    </Link>
                )}
            </div>

            <div className="shelf-container-wrapper">
                <div
                    className="shelf-container"
                    ref={scrollRef}
                    onScroll={updateScrollButtons}
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shelf-skeleton-card" />
                        ))
                    ) : (
                        <>
                            {leadingItem && (
                                <motion.div
                                    className="shelf-item"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0 }}
                                >
                                    {leadingItem}
                                </motion.div>
                            )}
                            {apps.map((app, index) => (
                                <motion.div
                                    key={app.slug}
                                    className="shelf-item"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (leadingItem ? index + 1 : index) * 0.05 }}
                                >
                                    <AppCard app={app} />
                                </motion.div>
                            ))}
                            {trailingItem && (
                                <motion.div
                                    className="shelf-item"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (apps.length + (leadingItem ? 1 : 0)) * 0.05 }}
                                >
                                    {trailingItem}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {!loading && apps.length > 0 && (
                    <>
                        {canScrollLeft && (
                            <button className="shelf-nav-btn prev" onClick={() => scroll('left')} aria-label="Previous">
                                ‹
                            </button>
                        )}
                        {canScrollRight && (
                            <button className="shelf-nav-btn next" onClick={() => scroll('right')} aria-label="Next">
                                ›
                            </button>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
