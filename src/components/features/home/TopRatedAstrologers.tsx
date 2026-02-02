'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

// Mock data - will be replaced with API data
const topAstrologers = [
  {
    id: '1',
    name: 'Pt. Rajesh Sharma',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    specialization: ['Vedic', 'Kundli'],
    languages: ['Hindi', 'English'],
    experience: 15,
    rating: 4.9,
    totalReviews: 2345,
    pricePerMinute: 25,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Dr. Priya Mehta',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialization: ['Numerology', 'Tarot'],
    languages: ['English', 'Hindi'],
    experience: 12,
    rating: 4.8,
    totalReviews: 1890,
    pricePerMinute: 30,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Acharya Vikram',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    specialization: ['Vastu', 'Palmistry'],
    languages: ['Hindi', 'Gujarati'],
    experience: 20,
    rating: 4.9,
    totalReviews: 3210,
    pricePerMinute: 35,
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Jyotishi Lakshmi',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    specialization: ['Marriage', 'Career'],
    languages: ['Tamil', 'English'],
    experience: 10,
    rating: 4.7,
    totalReviews: 1567,
    pricePerMinute: 20,
    isAvailable: true,
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function TopRatedAstrologers() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-lexend">
            Top Rated Astrologers
          </h2>
          <p className="text-text-secondary font-lexend text-sm">
            Consult with our highly rated experts
          </p>
        </div>
        <Link
          href="/browse-chat"
          className="flex items-center gap-1 text-primary hover:text-primary-dark font-medium font-lexend text-sm"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {topAstrologers.map((astrologer) => (
          <motion.div key={astrologer.id} variants={itemVariants}>
            <Link href={`/astrologer/${astrologer.id}`}>
              <div className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
                {/* Header with image and status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative">
                    <Image
                      src={astrologer.image}
                      alt={astrologer.name}
                      width={64}
                      height={64}
                      className="rounded-full border-2 border-secondary object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                        astrologer.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary font-lexend truncate">
                      {astrologer.name}
                    </h3>
                    <p className="text-sm text-text-secondary font-lexend">
                      {astrologer.experience} years exp
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-secondary fill-secondary" />
                      <span className="text-sm font-medium text-text-primary font-lexend">
                        {astrologer.rating}
                      </span>
                      <span className="text-xs text-text-muted font-lexend">
                        ({astrologer.totalReviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {astrologer.specialization.slice(0, 2).map((spec) => (
                    <Badge key={spec} variant="secondary" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Languages */}
                <p className="text-xs text-text-muted font-lexend mb-3">
                  {astrologer.languages.join(' • ')}
                </p>

                {/* Price and actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary font-lexend">
                      ₹{astrologer.pricePerMinute}
                    </span>
                    <span className="text-xs text-text-muted font-lexend">
                      /min
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={astrologer.isAvailable ? 'primary' : 'ghost'}
                      disabled={!astrologer.isAvailable}
                      className="!px-3"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={astrologer.isAvailable ? 'secondary' : 'ghost'}
                      disabled={!astrologer.isAvailable}
                      className="!px-3"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
