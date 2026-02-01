'use client';

import Link from 'next/link';

const SOCIAL_LINKS = [
    { name: 'Facebook', char: 'f', href: '#' },
    { name: 'Instagram', char: 'ig', href: '#' },
    { name: 'Reddit', char: 'r', href: '#' },
    { name: 'X', char: 'X', href: '#' },
    { name: 'YouTube', char: 'y', href: '#' },
    { name: 'TikTok', char: 'tk', href: '#' },
    { name: 'LinkedIn', char: 'in', href: '#' },
];

const FOOTER_LINKS = [
    { name: 'Cookie Preferences', href: '#' },
    { name: 'Terms and Conditions', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Join the SQuad', href: '#' },
    { name: 'Promote with us', href: '#' },
    { name: 'Suggest an app', href: '#' },
];

export default function StoreFooter() {
    return (
        <footer className="store-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-logo">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                            </svg>
                        </div>
                        <span className="logo-text">VR STORE</span>
                    </div>
                </div>

                <div className="footer-middle">
                    <div className="footer-socials">
                        {SOCIAL_LINKS.map(social => (
                            <Link key={social.name} href={social.href} className="social-icon" title={social.name}>
                                {social.char}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="footer-right">
                    <div className="footer-links">
                        {FOOTER_LINKS.map((link, index) => (
                            <span key={link.name} className="footer-link-item">
                                <Link href={link.href} className="footer-bottom-link">
                                    {link.name}
                                </Link>
                                {index < FOOTER_LINKS.length - 1 && <span className="footer-separator">|</span>}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
