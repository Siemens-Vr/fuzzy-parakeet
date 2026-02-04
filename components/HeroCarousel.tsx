'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const heroImages = [
  {
    id: 1,
    image: '/hero/default-hero-1.png',
    title: 'Pneumatics: Learn and experience',
    description:
      'Experience a risk-free, immersive dive into (electro)pneumatic and hydraulic systems.'
  },


  {
    id: 2,
    image: '/hero/default-hero.png',
    title: 'Death Match Mode',
    description: 'Learn all about Engineering'
  },
  {
    id: 3,
    image: '/hero/default-hero-1.png',
    title: 'Pneumatics: Learn and experience',
    description:
      'Experience a risk-free, immersive dive into (electro)pneumatic and hydraulic systems.'
  },
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

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);

  const goToSlide = (index: number) => setCurrentIndex(index);

  // Responsive hero height for the actual image container + img
  const HERO_H = 'clamp(260px, 45vh, 520px)';

  return (
    <div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(460px, 72vh, 650px)',
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

        {/* Texture overlay */}
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
            filter: 'blur(2px)'
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
              height: 'clamp(60px, 10vh, 100px)',
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
              padding: '0 clamp(22px, 5vw, 130px)',
              paddingBottom: '70px'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  width: '100%',
                  maxWidth: '1800px',
                  height: HERO_H,
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
                    height: HERO_H,
                    objectFit: 'cover',
                    borderRadius: '10px'
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
                color: 'white',
                transition: 'all 0.3s ease',
                zIndex: 7
              }}
              whileHover={{ borderColor: 'rgba(0, 184, 148, 1)' }}
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
                color: 'white',
                transition: 'all 0.3s ease',
                zIndex: 7
              }}
              whileHover={{ borderColor: 'rgba(0, 184, 148, 1)' }}
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

            {/* App info card (hide on laptop and smaller) */}
            <motion.div
              className="hero-info-card"
              key={`card-${currentIndex}`}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                right: 'clamp(60px, 12vw, 120px)',
                top: 'clamp(60px, 10vh, 120px)',
                width: 'min(330px, 40vw)',
                minHeight: '330px',
                padding: 'clamp(20px, 2vw, 26px)',
                borderRadius: '16px',
                background: 'black',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.55), inset 0 0 1px rgba(255,255,255,0.4)',

                textAlign: 'left',
                color: 'white',
                zIndex: 6
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(14px, 1.3vw, 18px)',
                  fontWeight: 800,
                  marginBottom: 8,
                  lineHeight: 1.2
                }}
              >
                {heroImages[currentIndex].title}
              </h2>

              <p
                style={{
                  fontSize: 'clamp(12px, 1.15vw, 14px)',
                  opacity: 0.9,
                  lineHeight: 1.5,
                  margin: 0
                }}
              >
                {heroImages[currentIndex].description}
              </p>
            </motion.div>

            {/* Indicators */}
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
                    style={
                      currentIndex === index
                        ? activeIndicatorStyle
                        : inactiveIndicatorStyle
                    }
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
