'use client';

import Link from 'next/link';
import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoaderOverlay() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 6000; // ⬅️ SLOW cinematic load (~4.2s)

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);

      // smooth ease-in-out (more natural)
      const eased =
        p < 0.5
          ? 4 * p * p * p
          : 1 - Math.pow(-2 * p + 2, 3) / 2;

      const value = Math.round(eased * 100);
      setProgress(value);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!redirected.current) {
        redirected.current = true;

        // pause at 100%
        setTimeout(() => {
          setFading(true);
        }, 700);

        // redirect after fade
        setTimeout(() => {
          router.push('/');
        }, 1400);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [router]);

  return (
    <Html center>
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'monospace',
          letterSpacing: 2,
          minWidth: 260,
          color: '#0f172a',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}
      >
        {/* TITLE */}
        <div style={{ fontSize: 18, marginBottom: 16 }}>
          {progress < 100 ? 'UNDER CONSTRUCTION' : 'REDIRECTING'}
        </div>

        {/* BAR */}
        <div
          style={{
            width: 240,
            height: 4,
            background: 'rgba(15,23,42,0.12)',
            margin: '0 auto 12px',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)',
              transition: 'width 120ms linear',
            }}
          />
        </div>

        {/* STATUS */}
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {progress < 100
            ? `Initializing… ${progress}%`
            : 'Returning to home page'}
        </div>

        <div style={{ fontSize: 11, opacity: 0.45, marginTop: 6 }}>
          Calibrating design parameters…
        </div>

        {/* MANUAL ESCAPE */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button
            style={{
              marginTop: 26,
              padding: '10px 18px',
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: '#0f172a',
              background: 'transparent',
              border: '1px solid rgba(15,23,42,0.35)',
              borderRadius: 22,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15,23,42,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ← Return Home
          </button>
        </Link>
      </div>
    </Html>
  );
}
