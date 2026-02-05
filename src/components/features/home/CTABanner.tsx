'use client';

/**
 * CTABanner Component
 * Design matches mobile app with:
 * - Semi-transparent white background
 * - Yellow border with shadow
 * - Banner decoration image on right
 * - Chat Now button
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function CTABanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl h-[115px]"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: '#FFCF0D',
        boxShadow: '0 4px 20px rgba(255, 207, 13, 0.2)',
      }}
    >
      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-center">
        <h3 className="text-[17px] leading-5 font-medium text-[#371B34] font-lexend">
          Talk to astrologer and{'\n'}clear your doubts
        </h3>
        <p className="text-[10px] text-[#371B34] font-lexend mt-1.5 max-w-[180px]">
          Open up to the thing that matters among the people
        </p>
        <Link href="/browse-chat">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 h-7 px-4 bg-primary rounded-[10px] text-white text-sm font-bold font-lexend inline-flex items-center justify-center"
          >
            Chat Now
          </motion.button>
        </Link>
      </div>

      {/* Banner Decoration Image */}
      <div className="absolute right-0 bottom-0 w-[193px] h-[115px]">
        <Image
          src="/images/banner-decoration.png"
          alt="Banner decoration"
          width={193}
          height={115}
          className="object-contain"
        />
      </div>
    </motion.div>
  );
}
