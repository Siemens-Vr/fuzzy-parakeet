'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleCard from '@/components/ArticleCard';
import { MOCK_ARTICLES, Article } from '@/lib/mockArticles';

const CATEGORIES = ['All', 'News', 'Tips', 'Hidden Gems', 'Blog', 'Review'] as const;

export default function ArticlesPage() {
    const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('All');

    const filteredArticles = MOCK_ARTICLES.filter(
        (article) => activeCategory === 'All' || article.category === activeCategory
    );

    const featuredArticle = MOCK_ARTICLES.find((a) => a.featured);
    const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

    return (
        <div className="articles-container">
            <header className="articles-header">
                <h1 className="articles-title">Latest Articles</h1>
                <p className="articles-subtitle">News, reviews, and guides from the VR community</p>
            </header>

            {/* Featured Article */}
            {activeCategory === 'All' && featuredArticle && (
                <section className="featured-section">
                    <ArticleCard article={featuredArticle} priority={true} />
                </section>
            )}

            {/* Category Chips */}
            <div className="category-chips">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        className={`chip ${activeCategory === category ? 'is-active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Article Grid */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    layout
                    className="articles-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {regularArticles.map((article) => (
                        <motion.div
                            layout
                            key={article.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ArticleCard article={article} />
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {filteredArticles.length === 0 && (
                <div className="empty-state">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>
                    <h2>No articles found</h2>
                    <p>Try selecting a different category</p>
                </div>
            )}
        </div>
    );
}
