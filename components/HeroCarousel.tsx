'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Your hero images - UPDATE THESE WITH YOUR ACTUAL IMAGE PATHS
const heroImages = [
  {
    id: 1,
    image: '/screenshots/hero1.png',
    title: 'Crystal Commanders',
    description: 'Construct an epic base and battle for peace in Crystal Comm...'
  },
  {
    id: 2,
    image: '/screenshots/hero.png',
    title: 'Battle: Mission of War Talent',
    description: 'Experience a taste of high-intensity action as you ...'
  },
  {
    id: 3,
    image: '/screenshots/space-explorer.jpg',
    title: 'Space Explorer VR',
    description: 'Journey through the cosmos in stunning VR'
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '500px',
      overflow: 'hidden',
      marginBottom: '2rem',
      backgroundColor: '#000'
    }}>
      {/* Blurred Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${heroImages[currentIndex].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            transform: 'scale(1.1)',
            zIndex: 1
          }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
        zIndex: 2
      }} />

      {/* Main Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        padding: '0 120px'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              width: '100%',
              maxWidth: '900px',
              height: '100%',
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
                height: '100%',
                objectFit: 'contain',
                borderRadius: '16px'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%230066cc;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%2300b894;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)" /%3E%3C/svg%3E';
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left Navigation Arrow */}
      <motion.button
        onMouseEnter={() => setIsHoveringLeft(true)}
        onMouseLeave={() => setIsHoveringLeft(false)}
        onClick={goToPrevious}
        style={{
          position: 'absolute',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          fontSize: '24px',
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
          animate={{
            x: isHoveringLeft ? [-3, 0, -3] : 0
          }}
          transition={{
            duration: 0.8,
            repeat: isHoveringLeft ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          ←
        </motion.div>
      </motion.button>

      {/* Right Navigation Arrow */}
      <motion.button
        onMouseEnter={() => setIsHoveringRight(true)}
        onMouseLeave={() => setIsHoveringRight(false)}
        onClick={goToNext}
        style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          fontSize: '24px',
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
          animate={{
            x: isHoveringRight ? [3, 0, 3] : 0
          }}
          transition={{
            duration: 0.8,
            repeat: isHoveringRight ? Infinity : 0,
            ease: 'easeInOut'
          }}
        >
          →
        </motion.div>
      </motion.button>

      {/* Bottom Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '12px 20px',
        borderRadius: '30px',
        zIndex: 10
      }}>
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: currentIndex === index ? '40px' : '12px',
              height: '12px',
              borderRadius: '6px',
              border: 'none',
              background: currentIndex === index 
                ? 'linear-gradient(135deg, #0066cc, #00b894)'
                : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: 0
            }}
            whileHover={{
              scale: 1.2,
              backgroundColor: currentIndex === index 
                ? undefined
                : 'rgba(255, 255, 255, 0.8)'
            }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Sign up button */}
      {/* <motion.button
        style={{
          position: 'absolute',
          top: '2rem',
          right: '50%',
          transform: 'translateX(50%)',
          padding: '12px 32px',
          background: 'transparent',
          border: '2px solid rgba(255, 105, 180, 0.8)',
          borderRadius: '25px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}
        whileHover={{
          scale: 1.05,
          backgroundColor: 'rgba(255, 105, 180, 0.2)',
          borderColor: 'rgba(255, 105, 180, 1)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        Sign up now
      </motion.button> */}

      {/* App info overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 4,
          color: 'white',
          maxWidth: '600px',
          padding: '0 20px'
        }}
      >
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}>
          {heroImages[currentIndex].title}
        </h2>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.9,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}>
          {heroImages[currentIndex].description}
        </p>
      </motion.div>
    </div>
  );
}