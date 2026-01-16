'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  visible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'solid';
  className?: string;
  style?: React.CSSProperties;
}

const sizeConfig = {
  sm: {
    width: 'clamp(36px, 4vw, 44px)',
    height: 'clamp(36px, 4vw, 44px)',
    fontSize: 'clamp(14px, 2vw, 18px)',
    border: '2px',
  },
  md: {
    width: 'clamp(44px, 6vw, 60px)',
    height: 'clamp(44px, 6vw, 60px)',
    fontSize: 'clamp(18px, 2.8vw, 24px)',
    border: '3px',
  },
  lg: {
    width: 'clamp(56px, 8vw, 72px)',
    height: 'clamp(56px, 8vw, 72px)',
    fontSize: 'clamp(22px, 3.5vw, 28px)',
    border: '3px',
  },
};

const variantConfig = {
  default: {
    border: 'rgba(255, 255, 255, 0.8)',
    background: 'rgba(0, 0, 0, 0.5)',
    hoverBackground: 'rgba(0, 102, 204, 0.9)',
    hoverBorder: 'rgba(0, 184, 148, 1)',
  },
  minimal: {
    border: 'rgba(255, 255, 255, 0.3)',
    background: 'rgba(30, 30, 35, 0.95)',
    hoverBackground: 'rgba(50, 50, 60, 0.98)',
    hoverBorder: 'rgba(255, 255, 255, 0.5)',
  },
  solid: {
    border: 'transparent',
    background: 'rgba(99, 102, 241, 0.9)',
    hoverBackground: 'rgba(129, 140, 248, 1)',
    hoverBorder: 'transparent',
  },
};

export function NavigationArrow({
  direction,
  onClick,
  visible = true,
  size = 'md',
  variant = 'default',
  className = '',
  style = {},
}: NavigationArrowProps) {
  const [isHovering, setIsHovering] = useState(false);

  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];
  const isLeft = direction === 'left';

  return (
    <motion.button
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      style={{
        width: sizeStyles.width,
        height: sizeStyles.height,
        borderRadius: '50%',
        border: `${sizeStyles.border} solid ${variantStyles.border}`,
        backgroundColor: variantStyles.background,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: visible ? 'pointer' : 'default',
        fontSize: sizeStyles.fontSize,
        color: 'white',
        transition: 'all 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        ...style,
      }}
      whileHover={{
        scale: 1.15,
        backgroundColor: variantStyles.hoverBackground,
        borderColor: variantStyles.hoverBorder,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ x: isHovering ? (isLeft ? [-3, 0, -3] : [3, 0, 3]) : 0 }}
        transition={{
          duration: 0.8,
          repeat: isHovering ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {isLeft ? '←' : '→'}
      </motion.div>
    </motion.button>
  );
}

// Convenience components for common positioned arrows
interface PositionedArrowProps {
  onClick: () => void;
  visible?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'solid';
  offset?: string;
}

export function LeftArrow({
  onClick,
  visible = true,
  size = 'md',
  variant = 'default',
  offset = 'clamp(10px, 2vw, 2rem)',
}: PositionedArrowProps) {
  return (
    <NavigationArrow
      direction="left"
      onClick={onClick}
      visible={visible}
      size={size}
      variant={variant}
      style={{
        position: 'absolute',
        left: offset,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }}
    />
  );
}

export function RightArrow({
  onClick,
  visible = true,
  size = 'md',
  variant = 'default',
  offset = 'clamp(10px, 2vw, 2rem)',
}: PositionedArrowProps) {
  return (
    <NavigationArrow
      direction="right"
      onClick={onClick}
      visible={visible}
      size={size}
      variant={variant}
      style={{
        position: 'absolute',
        right: offset,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
      }}
    />
  );
}

// Combined component for both arrows
interface NavigationArrowsProps {
  onLeftClick: () => void;
  onRightClick: () => void;
  showLeft?: boolean;
  showRight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'solid';
  offset?: string;
}

export default function NavigationArrows({
  onLeftClick,
  onRightClick,
  showLeft = true,
  showRight = true,
  size = 'md',
  variant = 'default',
  offset = 'clamp(10px, 2vw, 2rem)',
}: NavigationArrowsProps) {
  return (
    <>
      <LeftArrow
        onClick={onLeftClick}
        visible={showLeft}
        size={size}
        variant={variant}
        offset={offset}
      />
      <RightArrow
        onClick={onRightClick}
        visible={showRight}
        size={size}
        variant={variant}
        offset={offset}
      />
    </>
  );
}