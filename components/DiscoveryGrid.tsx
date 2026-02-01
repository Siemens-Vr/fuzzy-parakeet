'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const DISCOVERY_CARDS = [
    {
        title: 'Story & Adventure',
        description: 'Immerse yourself in epic narratives and vast worlds.',
        image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800',
        category: 'Adventure',
        color: '#ff4b2b'
    },
    {
        title: 'Multiplayer & Social',
        description: 'Connect, compete, and hang out with friends in VR.',
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=800',
        category: 'Social',
        color: '#00d2ff'
    },
    {
        title: 'Fitness & Movement',
        description: 'Turn your workout into an interactive game.',
        image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800',
        category: 'Fitness',
        color: '#9d50bb'
    }
];

export default function DiscoveryGrid() {
    return (
        <section className="discovery-section">
            <header className="section-header-centered">
                <h2 className="section-title">Choose your VR experience</h2>
                <p className="section-subtitle">Discover the perfect world for your gameplay style</p>
            </header>

            <div className="discovery-grid">
                {DISCOVERY_CARDS.map((card, index) => (
                    <motion.div
                        key={card.title}
                        className="discovery-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                    >
                        <Link href={`/apps?category=${card.category}`} className="discovery-card-link">
                            <div className="discovery-image-wrapper">
                                <img src={card.image} alt={card.title} className="discovery-image" />
                                <div className="discovery-overlay" style={{ background: `linear-gradient(to top, ${card.color}cc, transparent)` }} />
                            </div>
                            <div className="discovery-content">
                                <h3 className="discovery-card-title">{card.title}</h3>
                                <p className="discovery-card-desc">{card.description}</p>
                                <span className="discovery-cta">Explore Games →</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
