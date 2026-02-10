'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    coverImageUrl: string;
    category: string;
    authorName: string;
    readTime: string;
}

export default function ArticleShelf() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch('/api/public/articles?limit=3');
                if (res.ok) {
                    const data = await res.json();
                    setArticles(data);
                }
            } catch (error) {
                console.error('Failed to fetch articles', error);
            } finally {
                setLoading(false);
            }
        }
        fetchArticles();
    }, []);

    if (loading) return null; // Or a skeleton loader
    if (articles.length === 0) return null;

    return (
        <section className="article-shelf-section">
            <div className="shelf-header">
                <h2 className="shelf-title">Latest from VR Community</h2>
                <Link href="/articles" className="view-all-link">
                    Read More <span>→</span>
                </Link>
            </div>

            <div className="article-preview-grid">
                {articles.map((article, index) => (
                    <motion.div
                        key={article.id}
                        className="article-preview-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={`/articles/${article.slug}`} className="article-preview-link">
                            <div className="article-preview-image-wrapper">
                                <img src={article.coverImageUrl} alt={article.title} className="article-preview-image" />
                                <span className="article-preview-category">{article.category}</span>
                            </div>
                            <div className="article-preview-content">
                                <h3 className="article-preview-title">{article.title}</h3>
                                <div className="article-preview-meta">
                                    <span>{article.authorName}</span>
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
