'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PromoBanner() {
    return (
        <section className="promo-banner-section">
            <motion.div
                className="promo-banner"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="promo-content">
                    <span className="promo-badge">COMMUNITY</span>
                    <h2 className="promo-title">Join the SQuad Community</h2>
                    <p className="promo-text">
                        Stay updated with the latest in VR, get exclusive deals, and connect with
                        thousands of other VR enthusiasts. Your ultimate VR journey starts here.
                    </p>
                    <div className="promo-actions">
                        <Link href="/signup" className="vr-btn primary">Join Now</Link>
                        <Link href="/about" className="vr-btn secondary">Learn More</Link>
                    </div>
                </div>
                <div className="promo-visual">
                    <div className="visual-circle main" />
                    <div className="visual-circle sub" />
                    <div className="visual-dots" />
                </div>
            </motion.div>
        </section>
    );
}
