'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function DownloadButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ flex: 1 }}
    >
      <Link
        href={`/api/download/${slug}`}
        onClick={() => setBusy(true)}
        className={`btn btn-primary ${busy ? 'opacity-70' : ''}`}
        style={{ width: '100%' }}
      >
        {busy ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
            Starting…
          </motion.span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⬇️ Download APK
          </span>
        )}
      </Link>
    </motion.div>
  );
}