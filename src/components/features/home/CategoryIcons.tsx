'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Radio } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

/**
 * Color config mapping — we use explicit Tailwind class strings
 * because dynamic class interpolation (e.g. `bg-${color}/10`) is
 * not supported by Tailwind's JIT compiler.
 */
const colorConfig = {
  'Chat with Astrologer': {
    iconBg: 'bg-primary/10',
    accentText: 'text-primary',
    accentHoverText: 'group-hover:text-primary',
  },
  'Call an Astrologer': {
    iconBg: 'bg-green-500/10',
    accentText: 'text-green-600',
    accentHoverText: 'group-hover:text-green-600',
  },
  'Live Sessions': {
    iconBg: 'bg-red-500/10',
    accentText: 'text-red-500',
    accentHoverText: 'group-hover:text-red-500',
  },
  'Daily Horoscope': {
    iconBg: 'bg-purple-500/10',
    accentText: 'text-purple-600',
    accentHoverText: 'group-hover:text-purple-600',
  },
  'Free Kundli': {
    iconBg: 'bg-amber-500/10',
    accentText: 'text-amber-600',
    accentHoverText: 'group-hover:text-amber-600',
  },
  'Kundli Matching': {
    iconBg: 'bg-pink-500/10',
    accentText: 'text-pink-500',
    accentHoverText: 'group-hover:text-pink-500',
  },
} as const;

type CategoryLabel = keyof typeof colorConfig;

const categories = [
  {
    image: '/images/icons/icon-chat-category.png',
    label: 'Chat with Astrologer' as CategoryLabel,
    description: 'Get instant answers to your questions via text chat.',
    href: '/browse-chat',
    icon: MessageCircle,
  },
  {
    image: '/images/icons/icon-talk.png',
    label: 'Call an Astrologer' as CategoryLabel,
    description: 'Speak directly with expert astrologers over voice call.',
    href: '/browse-call',
    icon: Phone,
  },
  {
    image: '/images/icons/icon-live.png',
    label: 'Live Sessions' as CategoryLabel,
    description: 'Join live astrology sessions and interactive Q&As.',
    href: '/live-sessions',
    icon: Radio,
  },
  {
    image: '/images/icons/icon-horoscope.png',
    label: 'Daily Horoscope' as CategoryLabel,
    description: 'Check your daily, weekly, and monthly horoscope readings.',
    href: '/horoscope',
  },
  {
    image: '/images/icons/icon-kundli.png',
    label: 'Free Kundli' as CategoryLabel,
    description: 'Generate your birth chart with detailed analysis.',
    href: '/kundli',
  },
  {
    image: '/images/icons/icon-kundli-matching.png',
    label: 'Kundli Matching' as CategoryLabel,
    description: 'Check compatibility with Ashtakoota matching.',
    href: '/kundli-matching',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function CategoryIcons() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6"
    >
      {categories.map((category) => {
        const colors = colorConfig[category.label];

        return (
          <motion.div key={category.label} variants={itemVariants}>
            <Link
              href={category.href}
              className="group block bg-white rounded-xl border border-gray-100 p-5 card-hover-lift"
            >
              <div className="flex items-start gap-4">
                {/* Icon container with accent background + hover scale */}
                <div
                  className={`w-12 h-12 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}
                >
                  <Image
                    src={category.image}
                    alt={category.label}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold text-text-primary font-lexend ${colors.accentHoverText} transition-colors`}
                  >
                    {category.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary font-nunito mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Always-visible "Explore" link with arrow slide on hover */}
              <div
                className={`flex items-center gap-1 mt-3 text-xs font-medium ${colors.accentText} font-lexend transition-colors`}
              >
                Explore
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
