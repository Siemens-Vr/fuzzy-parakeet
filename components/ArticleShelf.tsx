'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MOCK_ARTICLES } from '@/lib/mockArticles';

export default function ArticleShelf() {
    const latestArticles = MOCK_ARTICLES.slice(0, 3);

    return (
        <section className="article-shelf-section">
            <div className="shelf-header">
                <h2 className="shelf-title">Latest from VR Community</h2>
                <Link href="/articles" className="view-all-link">
                    Read More <span>→</span>
                </Link>
            </div>

            <div className="article-preview-grid">
                {latestArticles.map((article, index) => (
                    <motion.div
                        key={article.id}
                        className="article-preview-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/articles/${article.slug}`} className="article-preview-link">
                            <div className="article-preview-image-wrapper">
                                <img src={article.image} alt={article.title} className="article-preview-image" />
                                <span className="article-preview-category">{article.category}</span>
                            </div>
                            <div className="article-preview-content">
                                <h3 className="article-preview-title">{article.title}</h3>
                                <div className="article-preview-meta">
                                    <span>{article.author.name}</span>
                                    <span className="dot">•</span>
                                    <span>{article.readTime} read</span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
