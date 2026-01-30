import { ReactNode } from 'react';
import '@/styles/admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="theme-admin" style={{ minHeight: '100vh', background: 'var(--app-bg)', color: 'var(--text-primary)' }}>
            {children}
        </div>
    );
}
