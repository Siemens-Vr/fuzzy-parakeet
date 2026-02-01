'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MOCK_ARTICLES } from '@/lib/mockArticles';
import ArticleCard from '@/components/ArticleCard';

export default function ArticleSinglePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;

    const article = MOCK_ARTICLES.find((a) => a.slug === slug);

    if (!article) {
        return (
            <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
                <h2>Article not found</h2>
                <p>The article you are looking for does not exist.</p>
                <button className="chip" onClick={() => router.push('/articles')}>
                    Back to Articles
                </button>
            </div>
        );
    }

    const relatedArticles = MOCK_ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

    return (
        <div className="article-single-container">
            {/* Navigation */}
            <nav className="article-nav">
                <button onClick={() => router.push('/articles')} className="back-btn">
                    <span>←</span> Back to Articles
                </button>
            </nav>

            {/* Hero Section */}
            <header className="article-hero">
                <div className="article-hero-content">
                    <motion.span
                        className="article-category-badge"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {article.category}
                    </motion.span>

                    <motion.h1
                        className="article-hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {article.title}
                    </motion.h1>

                    <motion.div
                        className="article-hero-meta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="author-info">
                            <img src={article.author.avatar} alt={article.author.name} className="author-avatar" />
                            <span>By {article.author.name}</span>
                        </div>
                        <span className="separator">•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        <span className="separator">•</span>
                        <span>{article.readTime} read</span>
                    </motion.div>
                </div>

                <motion.div
                    className="article-hero-image-wrapper"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <img src={article.image} alt={article.title} className="article-hero-image" />
                </motion.div>
            </header>

            {/* Content Section */}
            <main className="article-body-wrapper">
                <article
                    className="article-body"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </main>

            {/* Related Section */}
            {relatedArticles.length > 0 && (
                <section className="related-articles-section">
                    <h2 className="section-title">Keep Reading</h2>
                    <div className="articles-grid">
                        {relatedArticles.map((ra) => (
                            <ArticleCard key={ra.id} article={ra} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
