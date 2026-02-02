'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Radio,
  Star,
  FileText,
  Users,
  Sparkles,
  Heart,
} from 'lucide-react';

const categories = [
  {
    icon: MessageCircle,
    label: 'Chat',
    href: '/browse-chat',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Phone,
    label: 'Call',
    href: '/browse-call',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Radio,
    label: 'Live',
    href: '/live-sessions',
    color: 'bg-red-100 text-red-600',
    badge: 'LIVE',
  },
  {
    icon: Star,
    label: 'Horoscope',
    href: '/horoscope',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: FileText,
    label: 'Kundli',
    href: '/kundli',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Users,
    label: 'Matching',
    href: '/kundli-matching',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Sparkles,
    label: 'Panchang',
    href: '/panchang',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Heart,
    label: 'Remedies',
    href: '/remedies',
    color: 'bg-teal-100 text-teal-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CategoryIcons() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-4 md:grid-cols-8 gap-4"
    >
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <motion.div key={category.label} variants={itemVariants}>
            <Link
              href={category.href}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-6 h-6 md:w-7 md:h-7" />
                {category.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {category.badge}
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium text-text-secondary group-hover:text-text-primary font-lexend text-center">
                {category.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
