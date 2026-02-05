'use client';

/**
 * ZodiacCarousel Component
 * Animated carousel for zodiac sign selection matching mobile app design
 *
 * Features:
 * - 3-item visible carousel (left, center, right)
 * - Center item: full size, full opacity, blue background with white border
 * - Side items: scaled down, 50% opacity, elevated
 * - Smooth spring animations
 * - Touch/drag support
 * - Keyboard navigation
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { ZODIAC_SIGNS } from '@/lib/services/horoscope.service';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Carousel configuration matching mobile app
const CAROUSEL_CONFIG = {
  CENTER_ITEM_SIZE: 140,
  SIDE_ITEM_SIZE: 90,
  SIDE_SCALE: 0.65,
  CENTER_OPACITY: 1.0,
  SIDE_OPACITY: 0.6,
  SIDE_TRANSLATE_Y: -15,
  CENTER_BG_COLOR: '#2930A6',
  SPRING_CONFIG: {
    damping: 28,
    stiffness: 180,
    mass: 0.6,
  },
};

interface ZodiacCarouselProps {
  selectedSign?: string;
  onSignChange?: (signId: string) => void;
  className?: string;
}

export function ZodiacCarousel({
  selectedSign,
  onSignChange,
  className,
}: ZodiacCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(() => {
    const index = ZODIAC_SIGNS.findIndex((s) => s.id === selectedSign);
    return index >= 0 ? index : 0;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragX = useMotionValue(0);

  // Get the currently active sign
  const activeSign = ZODIAC_SIGNS[activeIndex];

  // Navigate to specific index
  const goToIndex = useCallback((index: number) => {
    // Handle circular navigation
    let newIndex = index;
    if (index < 0) newIndex = ZODIAC_SIGNS.length - 1;
    if (index >= ZODIAC_SIGNS.length) newIndex = 0;

    setActiveIndex(newIndex);
    onSignChange?.(ZODIAC_SIGNS[newIndex].id);
  }, [onSignChange]);

  // Navigation functions
  const goToPrev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);
  const goToNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToIndex(ZODIAC_SIGNS.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, goToIndex]);

  // Update active index when selectedSign prop changes
  useEffect(() => {
    if (selectedSign) {
      const index = ZODIAC_SIGNS.findIndex((s) => s.id === selectedSign);
      if (index >= 0 && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  }, [selectedSign, activeIndex]);

  // Handle drag end
  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset < -threshold || velocity < -500) {
      goToNext();
    } else if (offset > threshold || velocity > 500) {
      goToPrev();
    }

    setIsDragging(false);
    animate(dragX, 0, { type: 'spring', ...CAROUSEL_CONFIG.SPRING_CONFIG });
  }, [goToNext, goToPrev, dragX]);

  // Get visible signs (previous, current, next)
  const getVisibleSigns = () => {
    const prevIndex = activeIndex === 0 ? ZODIAC_SIGNS.length - 1 : activeIndex - 1;
    const nextIndex = activeIndex === ZODIAC_SIGNS.length - 1 ? 0 : activeIndex + 1;

    return [
      { sign: ZODIAC_SIGNS[prevIndex], position: -1 },
      { sign: ZODIAC_SIGNS[activeIndex], position: 0 },
      { sign: ZODIAC_SIGNS[nextIndex], position: 1 },
    ];
  };

  const visibleSigns = getVisibleSigns();

  const CarouselItem = ({ sign, position }: { sign: typeof ZODIAC_SIGNS[0]; position: number }) => {
    const isCenter = position === 0;

    return (
      <motion.div
        className={cn(
          'flex flex-col items-center justify-center rounded-full cursor-pointer relative',
          isCenter ? 'z-10' : 'z-0'
        )}
        style={{
          width: isCenter ? CAROUSEL_CONFIG.CENTER_ITEM_SIZE : CAROUSEL_CONFIG.SIDE_ITEM_SIZE,
          height: isCenter ? CAROUSEL_CONFIG.CENTER_ITEM_SIZE : CAROUSEL_CONFIG.SIDE_ITEM_SIZE,
        }}
        initial={false}
        animate={{
          scale: isCenter ? 1 : CAROUSEL_CONFIG.SIDE_SCALE,
          opacity: isCenter ? CAROUSEL_CONFIG.CENTER_OPACITY : CAROUSEL_CONFIG.SIDE_OPACITY,
          y: isCenter ? 0 : CAROUSEL_CONFIG.SIDE_TRANSLATE_Y,
        }}
        transition={{
          type: 'spring',
          ...CAROUSEL_CONFIG.SPRING_CONFIG,
        }}
        whileHover={{ scale: isCenter ? 1.05 : CAROUSEL_CONFIG.SIDE_SCALE * 1.1 }}
        whileTap={{ scale: isCenter ? 0.95 : CAROUSEL_CONFIG.SIDE_SCALE * 0.9 }}
        onClick={() => {
          if (!isCenter) {
            goToIndex(ZODIAC_SIGNS.findIndex((s) => s.id === sign.id));
          }
        }}
      >
        {/* Background Circle with Border */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            isCenter
              ? 'bg-primary border-4 border-white/30 shadow-[0_8px_32px_rgba(41,48,166,0.4)]'
              : 'bg-white/10 border-2 border-white/20'
          )}
        />

        {/* Image */}
        <div className="relative z-10">
          {sign.image ? (
            <Image
              src={sign.image}
              alt={sign.name}
              width={isCenter ? 100 : 60}
              height={isCenter ? 100 : 60}
              className="object-contain"
              priority={isCenter}
            />
          ) : (
            <span className={cn('text-4xl', isCenter ? 'text-white' : 'text-white/70')}>
              {sign.symbol}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn('relative', className)}>
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: CAROUSEL_CONFIG.CENTER_ITEM_SIZE * 1.4 }}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 md:left-8 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Previous sign"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Draggable Carousel Track */}
        <motion.div
          className="flex items-center justify-center gap-6 md:gap-10"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
        >
          {visibleSigns.map(({ sign, position }) => (
            <CarouselItem key={sign.id} sign={sign} position={position} />
          ))}
        </motion.div>

        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          aria-label="Next sign"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Sign Name and Date Range */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSign.id}
          className="text-center mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white">{activeSign.name}</h3>
          <p className="text-white/70 text-sm">{activeSign.dateRange}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {ZODIAC_SIGNS.map((sign, index) => (
          <button
            key={sign.id}
            onClick={() => goToIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === activeIndex
                ? 'bg-secondary w-6'
                : 'bg-white/40 w-2 hover:bg-white/60'
            )}
            aria-label={`Go to ${sign.name}`}
          />
        ))}
      </div>
    </div>
  );
}
