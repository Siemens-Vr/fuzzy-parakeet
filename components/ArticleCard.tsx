'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Article } from '@/lib/mockArticles';

interface ArticleCardProps {
    article: Article;
    priority?: boolean;
}

export default function ArticleCard({ article, priority = false }: ArticleCardProps) {
    return (
        <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
            <motion.div
                className={`article-card ${priority ? 'is-featured' : ''}`}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <div className="article-image-wrapper">
                    <motion.img
                        src={article.image}
                        alt={article.title}
                        className="article-image"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                    />
                    <span className="article-category">{article.category}</span>
                </div>

                <div className="article-content">
                    <div className="article-meta">
                        <span className="article-date">{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span className="article-read-time">{article.readTime} read</span>
                    </div>

                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>

                    <div className="article-author">
                        <img src={article.author.avatar} alt={article.author.name} className="author-avatar" />
                        <span className="author-name">By {article.author.name}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
