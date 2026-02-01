'use client';

import { motion } from 'framer-motion';
import AppShelf from './AppShelf';
import { type AppMeta } from '@/components/AppCard';

interface SideloadShelfProps {
    apps: AppMeta[];
    loading?: boolean;
}

export default function SideloadShelf({ apps, loading }: SideloadShelfProps) {
    return (
        <div className="sideload-shelf-wrapper">
            <div className="sideload-theme-overlay" />
            <AppShelf
                title="Experimental & Early Access"
                apps={apps}
                loading={loading}
                viewAllHref="/apps?category=Experimental"
            />
            <div className="sideload-footer">
                <p className="sideload-info">
                    <span>⚠️</span> These projects are in early development. Expect bugs and experimental features.
                </p>
            </div>
        </div>
    );
}
