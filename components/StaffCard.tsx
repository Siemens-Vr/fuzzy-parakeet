'use client';

import { motion } from 'framer-motion';

type Props = {
  title?: string;
};

export default function StaffPicksCard({ title = 'Latest staff\npicks' }: Props) {
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: {
          y: 0,
          scale: 1,
          boxShadow: '0 18px 45px rgba(0,0,0,0.55)',
        },
        hover: {
          y: -6,
          scale: 1.01,
          boxShadow: '0 26px 70px rgba(0,0,0,0.75)',
        },
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        width: 260,
        height: 240,
        borderRadius: 18,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(20, 20, 20, 0.72)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* subtle vignette */}
      <motion.div
        variants={{
          rest: { opacity: 0.55 },
          hover: { opacity: 0.8 },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(90% 90% at 30% 20%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 55%), radial-gradient(120% 120% at 70% 80%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* top-left neon arc */}
      <motion.div
        variants={{
          rest: {
            opacity: 0.85,
            filter: 'blur(0px)',
          },
          hover: {
            opacity: 1,
            filter: 'blur(0.2px)',
          },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: -60,
          top: -60,
          width: 160,
          height: 160,
          borderRadius: '50%',
          border: '4px solid rgba(255, 90, 200, 0.95)',
          boxShadow:
            '0 0 14px rgba(255,90,200,0.55), 0 0 30px rgba(255,90,200,0.35)',
          pointerEvents: 'none',
        }}
      />

      {/* top-right white ring */}
      <motion.div
        variants={{
          rest: {
            scale: 1,
            opacity: 0.9,
            boxShadow:
              '0 0 10px rgba(255,255,255,0.25), 0 0 0 rgba(255,255,255,0)',
          },
          hover: {
            scale: 1.06,
            opacity: 1,
            boxShadow:
              '0 0 16px rgba(255,255,255,0.45), 0 0 34px rgba(255,255,255,0.18)',
          },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          right: 26,
          top: 26,
          width: 78,
          height: 78,
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.95)',
          background: 'rgba(0,0,0,0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* faint inner circular haze (appears more on hover) */}
      <motion.div
        variants={{
          rest: { opacity: 0.18, scale: 1 },
          hover: { opacity: 0.38, scale: 1.05 },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          right: -40,
          top: 60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 35%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* bottom fade */}
      <motion.div
        variants={{
          rest: { opacity: 0.55 },
          hover: { opacity: 0.85 },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 120,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* text */}
      <div
        style={{
          position: 'absolute',
          left: 22,
          bottom: 28,
          color: 'white',
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1.15,
          whiteSpace: 'pre-line',
          letterSpacing: '-0.01em',
          textShadow: '0 10px 24px rgba(0,0,0,0.55)',
        }}
      >
        {title}
      </div>
    </motion.div>
  );
}
