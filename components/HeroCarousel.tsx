'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const heroImages = [
  {
    id: 1,
    image: '/hero/default-hero.png',
    title: 'Crystal Commanders',
    description: 'Construct an epic base and battle for peace in Crystal Comm...'
  },
  {
    id: 2,
    image: '/hero/default-hero-1.png',
    title: 'Pneumatics: Learn and experience',
    description: 'Experience pneumatics in real life'
  },
  // {
  //   id: 3,
  //   image: '/screenshots/skilldrive.png',
  //   title: 'Skills Drive Explorer',
  //   description: 'Learn all about Engineering'
  // }
];
const activeIndicatorStyle = {
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
const inactiveIndicatorStyle = {
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

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % heroImages.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

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
          height: 'clamp(520px, 75vh, 710px)',
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
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroImages[currentIndex].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
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
              filter: 'contrast(1.08) saturate(0.9)',

            
            }}
          />

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            // background:
            //   'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)',
            // zIndex: 2
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
          {/* Top bar */}
          <div
            style={{
              // responsive bar height (keeps the same “signup on top” layout)
              height: 'clamp(72px, 10vh, 100px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px'
            }}
          >
            {/* <motion.button
              style={{
                // responsive padding + font size while preserving the look
                padding: 'clamp(8px, 1.4vh, 10px) clamp(22px, 5vw, 40px)',
                borderRadius: '999px',
                background:
                  'radial-gradient(circle at 50% 0%, #ffffff 0, #ff9adf 30%, #ff3d9b 60%, #2b002f 100%)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                color: '#ffffff',
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow:
                  '0 0 10px rgba(255, 61, 155, 0.9), 0 0 25px rgba(255, 61, 155, 0.7), 0 0 40px rgba(255, 61, 155, 0.5)'
              }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  '0 0 15px rgba(255, 255, 255, 1), 0 0 35px rgba(255, 61, 155, 0.9), 0 0 55px rgba(255, 61, 155, 0.8)'
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                // router.push('/signup');
              }}
            >
              Sign up now
            </motion.button> */}
          </div>

          {/* Hero */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 clamp(16px, 6vw, 120px)'
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
                  maxWidth: '2000px',
                  height: '450px',
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
                    height: '450px',
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
                transition: 'all 0.3s ease'
              }}
              whileHover={{
                scale: 1.15,
                backgroundColor: 'rgba(0, 102, 204, 0.9)',
                borderColor: 'rgba(0, 184, 148, 1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ x: isHoveringLeft ? [-3, 0, -3] : 0 }}
                transition={{
                  duration: 0.8,
                  repeat: isHoveringLeft ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                ←
              </motion.div>
            </motion.button>

            {/* Right arrow */}
            <motion.button
              onMouseEnter={() => setIsHoveringRight(true)}
              onMouseLeave={() => setIsHoveringRight(false)}
              onClick={goToNext}
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
                transition: 'all 0.3s ease'
              }}
              whileHover={{
                scale: 1.15,
                backgroundColor: 'rgba(0, 102, 204, 0.9)',
                borderColor: 'rgba(0, 184, 148, 1)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ x: isHoveringRight ? [3, 0, 3] : 0 }}
                transition={{
                  duration: 0.8,
                  repeat: isHoveringRight ? Infinity : 0,
                  ease: 'easeInOut'
                }}
              >
                →
              </motion.div>
            </motion.button>

          

            {/* App info overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'absolute',
                bottom: 'clamp(64px, 10vh, 6rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: 'white',
                maxWidth: '600px',
                padding: '0 20px'
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                }}
              >
                {heroImages[currentIndex].title}
              </h2>
              <p
                style={{
                  fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)',
                  opacity: 0.9,
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                }}
              >
                {heroImages[currentIndex].description}
              </p>
            </motion.div>
          </div>

          {/* Indicators BELOW hero */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '16px',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  //  background: 'rgba(255,255,255,0.08)',
                  //   backdropFilter: 'blur(12px)',
                    padding: '10px 18px',
                  //   borderRadius: '999px',
                  //   boxShadow: `
                  //     inset 0 0 1px rgba(255,255,255,0.4),
                  //     0 0 12px rgba(255,255,255,0.15)
                  //   `
                }}
              >
                {heroImages.map((_, index) => (
                  <motion.button
                      key={index}
                      onClick={() => goToSlide(index)}
                      style={
                        currentIndex === index
                          ? activeIndicatorStyle
                          : inactiveIndicatorStyle
                      }
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      whileHover={{
                        scale: 1.15,
                        boxShadow:
                          currentIndex === index
                            ? `
                              0 0 8px rgba(255,255,255,1),
                              0 0 18px rgba(255,255,255,0.9),
                              0 0 30px rgba(255,255,255,0.7)
                            `
                            : undefined
                      }}
                      whileTap={{ scale: 0.9 }}
                    />

                ))}
              </div>
            </div>

        </div>

        {/* small-screen refinements without changing behavior */}
        <style jsx>{`
          @media (max-width: 480px) {
            /* keep arrows usable but reduce “covering” the image */
            :global(button) {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}</style>
      </div>
      

    </div>
  );
}
