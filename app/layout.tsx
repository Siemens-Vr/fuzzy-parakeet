'use client';
import './globals.css';
import { motion } from 'framer-motion';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="main-container" style={{ padding: 0, maxWidth: '100%' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </body>
    </html>
  );
}