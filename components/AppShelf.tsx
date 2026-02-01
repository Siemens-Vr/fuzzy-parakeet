'use client';

import { motion } from 'framer-motion';
import AppCard, { type AppMeta } from '@/components/AppCard';
import Link from 'next/link';
import { useRef } from 'react';

interface AppShelfProps {
    title: string;
    apps: AppMeta[];
    viewAllHref?: string;
    loading?: boolean;
}

export default function AppShelf({ title, apps, viewAllHref, loading }: AppShelfProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 600;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
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
                <div className="shelf-container" ref={scrollRef}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shelf-skeleton-card" />
                        ))
                    ) : (
                        apps.map((app, index) => (
                            <motion.div
                                key={app.slug}
                                className="shelf-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <AppCard app={app} />
                            </motion.div>
                        ))
                    )}
                </div>

                {!loading && apps.length > 0 && (
                    <>
                        <button className="shelf-nav-btn prev" onClick={() => scroll('left')} aria-label="Previous">
                            ‹
                        </button>
                        <button className="shelf-nav-btn next" onClick={() => scroll('right')} aria-label="Next">
                            ›
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}
