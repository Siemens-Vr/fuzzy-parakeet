'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const heroImages = [
  {
    id: 1,
    image: '/hero/default-hero-6.png',
    title: 'Skills Drive Explorer',
    description: 'Construct an epic base and battle for peace in Crystal Comm...'
  },
  {
    id: 2,
    image: '/hero/default-hero-1.png',
    title: 'Pneumatics: Learn and experience',
    description:
      'Experience a risk-free, immersive dive into (electro)pneumatic and hydraulic systems.'
  },
  {
    id: 3,
    image: '/hero/default-hero.png',
    title: 'Death Match Mode',
    description: 'Learn all about Engineering'
  }
];

const activeIndicatorStyle: React.CSSProperties = {
  width: '60px',
  height: '10px',
  borderRadius: '999px',
  border: 'none',
  background: '#ffffff',
  cursor: 'pointer',
  padding: 0,
  boxShadow: `
    0 0 6px rgba(255, 255, 255, 0.9),
    0 0 12px rgba(255, 255, 255, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5)
  `
};

const inactiveIndicatorStyle: React.CSSProperties = {
  width: '60px',
  height: '10px',
  borderRadius: '999px',
  border: 'none',
  background: 'rgba(255,255,255,0.35)',
  cursor: 'pointer',
  padding: 0
};

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const goToSlide = (index: number) => setCurrentIndex(index);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(500px, 72vh, 650px)',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}
      >
        {/* Blurred background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroImages[currentIndex].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(5px)',
              transform: 'scale(1.1)',
              zIndex: 1
            }}
          />
        </AnimatePresence>

        {/* Texture / angled overlay (BOTTOM-ANCHORED) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '45%',
            zIndex: 2,
            pointerEvents: 'none',
            backgroundImage: `url('/hero/texture-angle.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.9,
            filter: 'blur(2px)',
            // filter: 'contrast(1.08) saturate(0.9)'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {/* Top bar spacer */}
          <div
            style={{
              height: 'clamp(72px, 10vh, 100px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px'
            }}
          />

          {/* Hero */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 clamp(16px, 6vw, 120px)',
              paddingBottom: '70px', // space for pinned indicators
              top: '-10px'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  width: '100%',
                  maxWidth: '1800px',
                  height: '500px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <img
                  src={heroImages[currentIndex].image}
                  alt={heroImages[currentIndex].title}
                  style={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                    borderRadius: '10px'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%230066cc;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2300b894;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)" /%3E%3C/svg%3E';
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Left arrow */}
            <motion.button
              onMouseEnter={() => setIsHoveringLeft(true)}
              onMouseLeave={() => setIsHoveringLeft(false)}
              onClick={goToPrevious}
              type="button"
              style={{
                position: 'absolute',
                left: 'clamp(10px, 2vw, 2rem)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'clamp(44px, 6vw, 60px)',
                height: 'clamp(44px, 6vw, 60px)',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 'clamp(18px, 2.8vw, 24px)',
                color: 'white',
                transition: 'all 0.3s ease',
                zIndex: 7
              }}
              whileHover={{
                borderColor: 'rgba(0, 184, 148, 1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                style={{ fontSize: 20, fontWeight: 600, lineHeight: 1 }}
                animate={{ x: isHoveringLeft ? [-3, 0, -3] : 0 }}
                transition={{
                  duration: 0.8,
                  repeat: isHoveringLeft ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                &lt;
              </motion.div>
            </motion.button>

            {/* Right arrow */}
            <motion.button
              onMouseEnter={() => setIsHoveringRight(true)}
              onMouseLeave={() => setIsHoveringRight(false)}
              onClick={goToNext}
              type="button"
              style={{
                position: 'absolute',
                right: 'clamp(10px, 2vw, 2rem)',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'clamp(44px, 6vw, 60px)',
                height: 'clamp(44px, 6vw, 60px)',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 'clamp(18px, 2.8vw, 24px)',
                color: 'white',
                transition: 'all 0.3s ease',
                zIndex: 7
              }}
              whileHover={{
                borderColor: 'rgba(0, 184, 148, 1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                style={{ fontSize: 20, fontWeight: 600, lineHeight: 1 }}
                animate={{ x: isHoveringRight ? [3, 0, 3] : 0 }}
                transition={{
                  duration: 0.8,
                  repeat: isHoveringRight ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                &gt;
              </motion.div>
            </motion.button>

            {/* App info card ON TOP of hero image */}
            <motion.div
              key={`card-${currentIndex}`}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: '82%',
                top: '100px',
                transform: 'translateX(-50%)',
                maxWidth: '250px',
                height: '250px',
                width: 'calc(100% - 100px)',
                padding: 'clamp(16px, 3vw, 28px)',
                borderRadius: '16px',
                background: 'black',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: `
                  0 10px 30px rgba(0,0,0,0.55),
                  inset 0 0 1px rgba(255,255,255,0.4)
                `,
                textAlign: 'center',
                color: 'white',
                zIndex: 6
              }}
            >
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  lineHeight: 1.2,
                  textShadow: '0 2px 12px rgba(0,0,0,0.9)'
                }}
              >
                {heroImages[currentIndex].title}
              </h2>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
                  opacity: 0.9,
                  lineHeight: 1.5,
                  textShadow: '0 2px 10px rgba(0,0,0,0.85)'
                }}
              >
                {heroImages[currentIndex].description}
              </p>
            </motion.div>

            {/* Indicators (PINNED bottom so they don't get clipped) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '16px',
                zIndex: 8,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  // background: 'rgba(0,0,0,0.45)',
                  // border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  pointerEvents: 'auto'
                }}
              >
                {heroImages.map((_, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    style={currentIndex === index ? activeIndicatorStyle : inactiveIndicatorStyle}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* small-screen refinements */}
          <style jsx>{`
            @media (max-width: 480px) {
              :global(button) {
                -webkit-tap-highlight-color: transparent;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
