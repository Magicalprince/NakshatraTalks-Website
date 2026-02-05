'use client';

/**
 * CategoryIcons Component
 * Design matches mobile app with:
 * - Image icons in white cards with yellow border
 * - Yellow shadow glow effect
 * - Ripple animation on press
 * - Three main categories: Daily Horoscope, Kundli, Kundli Matching
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    image: '/images/icons/icon-horoscope.png',
    label: 'Daily Horoscope',
    href: '/horoscope',
  },
  {
    image: '/images/icons/icon-kundli.png',
    label: 'Kundli',
    href: '/kundli',
  },
  {
    image: '/images/icons/icon-kundli-matching.png',
    label: 'Kundli Matching',
    href: '/kundli-matching',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

export function CategoryIcons() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-evenly items-start"
    >
      {categories.map((category) => (
        <motion.div
          key={category.label}
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <Link href={category.href} className="flex flex-col items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, rotate: [-4, 4, 0] }}
              className="relative"
            >
              {/* Ripple effect placeholder */}
              <div className="absolute inset-0 bg-secondary/30 rounded-2xl opacity-0 group-active:opacity-100 group-active:scale-150 transition-all duration-300" />

              {/* Icon container with yellow border and shadow */}
              <div
                className="relative w-[74px] h-[74px] bg-white rounded-2xl flex items-center justify-center border-2 border-secondary transition-all duration-200 group-hover:shadow-xl"
                style={{
                  boxShadow: '0 6px 20px rgba(255, 207, 13, 0.4)',
                  borderColor: '#FFCF0D',
                }}
              >
                <Image
                  src={category.image}
                  alt={category.label}
                  width={42}
                  height={42}
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Label */}
            <span className="text-[10px] text-text-muted font-medium font-poppins text-center mt-2 max-w-[74px] leading-tight">
              {category.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
