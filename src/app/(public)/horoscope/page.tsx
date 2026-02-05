'use client';

/**
 * Daily Horoscope Page
 * Matches mobile app design with zodiac carousel and category cards
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZodiacCarousel,
  HoroscopeDayTabs,
  HoroscopeCategoryCard,
  type HoroscopeDay,
  type HoroscopeCategory,
} from '@/components/features/horoscope';
import { ZODIAC_SIGNS } from '@/lib/services/horoscope.service';
import { Card } from '@/components/ui/Card';
import { Palette, Hash, Heart } from 'lucide-react';

// Mock horoscope data - In production, this would come from API
const MOCK_HOROSCOPES: Record<string, Record<HoroscopeDay, {
  general: string;
  love: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
}>> = {
  aries: {
    yesterday: {
      general: 'Yesterday brought some reflective moments that helped you understand your path better. The energy was introspective, allowing you to reconnect with your inner motivations.',
      love: 'Your romantic relationships needed patience yesterday. Communication with your partner may have felt challenging, but understanding was achieved by day\'s end.',
      career: 'Work projects moved at a slower pace, but this gave you time to refine your strategies. Colleagues appreciated your thoughtful approach.',
      health: 'Energy levels were moderate. Rest was important, and those who prioritized sleep felt more balanced.',
      luckyNumber: 7,
      luckyColor: 'Crimson',
      compatibility: 'Leo',
    },
    today: {
      general: 'Today brings a surge of confident energy that will help you tackle any challenge. Mars, your ruling planet, aligns favorably with Jupiter, amplifying your natural leadership abilities. Trust your instincts and take bold action.',
      love: 'Romance is highlighted today as Venus sends harmonious vibes your way. Single Aries may encounter someone intriguing, while those in relationships will enjoy deeper emotional connections.',
      career: 'Professional opportunities are abundant. Your innovative ideas will be well-received by colleagues and superiors alike. A new project or responsibility may come your way.',
      health: 'Your physical energy is at its peak. Channel this vitality into exercise or outdoor activities. Stay hydrated and maintain your momentum throughout the day.',
      luckyNumber: 9,
      luckyColor: 'Red',
      compatibility: 'Sagittarius',
    },
    tomorrow: {
      general: 'Tomorrow promises exciting developments as the cosmic energy shifts in your favor. Be prepared for unexpected opportunities that could change your direction positively.',
      love: 'Emotional connections deepen tomorrow. Express your feelings openly and watch how your relationships transform for the better.',
      career: 'A significant career milestone awaits. Your hard work will finally be recognized. Stay confident in presentations and meetings.',
      health: 'Focus on mental wellness tomorrow. Meditation or yoga will help maintain your energetic balance and clarity.',
      luckyNumber: 3,
      luckyColor: 'Orange',
      compatibility: 'Leo',
    },
  },
  taurus: {
    yesterday: {
      general: 'Yesterday was about grounding yourself and appreciating the simple pleasures in life. You found comfort in familiar routines.',
      love: 'Romantic energy was steady and reassuring. Quality time with loved ones brought contentment.',
      career: 'Financial matters required attention. Your practical approach helped navigate any challenges.',
      health: 'Physical comfort was important. Treating yourself to good food and rest was beneficial.',
      luckyNumber: 6,
      luckyColor: 'Emerald',
      compatibility: 'Virgo',
    },
    today: {
      general: 'Venus showers you with abundance today, Taurus. Your appreciation for beauty and comfort will be heightened. Financial matters look favorable, and your patient approach will yield results.',
      love: 'Love flourishes under today\'s gentle cosmic influence. Your sensual nature attracts admirers, while existing relationships deepen with shared pleasures and heartfelt conversations.',
      career: 'Steady progress marks your professional life today. Your reliability and dedication are noticed. A financial opportunity or raise may be on the horizon.',
      health: 'Pamper yourself today. Your body craves comfort and nourishment. A massage, healthy meal, or nature walk will rejuvenate your spirit.',
      luckyNumber: 4,
      luckyColor: 'Green',
      compatibility: 'Cancer',
    },
    tomorrow: {
      general: 'Tomorrow brings stability and growth. Your methodical approach to challenges will prove successful. Trust in your abilities.',
      love: 'Deep conversations strengthen bonds tomorrow. Share your dreams and listen to your partner\'s aspirations.',
      career: 'A collaborative project gains momentum. Your input will be invaluable to the team\'s success.',
      health: 'Outdoor activities benefit you tomorrow. Fresh air and nature will revitalize your energy.',
      luckyNumber: 2,
      luckyColor: 'Pink',
      compatibility: 'Capricorn',
    },
  },
};

// Generate fallback horoscope for signs not in mock data
const generateFallbackHoroscope = (signName: string, day: HoroscopeDay) => {
  const dayTexts = {
    yesterday: 'reflected on',
    today: 'focuses on',
    tomorrow: 'will bring',
  };

  return {
    general: `${signName} ${dayTexts[day]} personal growth and self-discovery. The cosmic energy supports your natural traits and encourages you to embrace your unique strengths. Trust in the universe's plan for you.`,
    love: `Relationships ${day === 'tomorrow' ? 'will require' : 'require'} attention and nurturing. Open communication ${day === 'tomorrow' ? 'will strengthen' : 'strengthens'} bonds with loved ones. Single ${signName} natives may find interesting connections.`,
    career: `Professional matters ${day === 'tomorrow' ? 'will progress' : 'progress'} steadily. Your dedication and hard work ${day === 'tomorrow' ? 'will be' : 'are'} recognized. Stay focused on your long-term goals.`,
    health: `Physical and mental wellness ${day === 'tomorrow' ? 'will deserve' : 'deserve'} attention. Balance activity with rest, and don't forget to nourish your mind through positive thoughts and meditation.`,
    luckyNumber: Math.floor(Math.random() * 9) + 1,
    luckyColor: ['Blue', 'Purple', 'Gold', 'Silver', 'Teal', 'Coral'][Math.floor(Math.random() * 6)],
    compatibility: ZODIAC_SIGNS[Math.floor(Math.random() * 12)].name,
  };
};

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [activeDay, setActiveDay] = useState<HoroscopeDay>('today');

  // Get current horoscope data
  const currentHoroscope = useMemo(() => {
    const signData = MOCK_HOROSCOPES[selectedSign];
    if (signData && signData[activeDay]) {
      return signData[activeDay];
    }
    const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
    return generateFallbackHoroscope(sign?.name || 'Your sign', activeDay);
  }, [selectedSign, activeDay]);

  const currentSign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
  const categories: HoroscopeCategory[] = ['general', 'love', 'career', 'health'];

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header Section with Carousel */}
      <div className="bg-gradient-to-b from-primary via-primary to-primary/95 pt-6 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Daily Horoscope
            </h1>
            <p className="text-white/70 text-sm">
              Select your zodiac sign to read your prediction
            </p>
          </div>

          {/* Zodiac Carousel */}
          <ZodiacCarousel
            selectedSign={selectedSign}
            onSignChange={setSelectedSign}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-2xl -mt-4">
        {/* White Card Container */}
        <div className="bg-white rounded-t-3xl shadow-lg min-h-[60vh] pb-24">
          {/* Day Tabs */}
          <div className="pt-6 pb-4">
            <HoroscopeDayTabs
              activeDay={activeDay}
              onDayChange={setActiveDay}
            />
          </div>

          {/* Lucky Info Bar */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-center gap-4 py-3 bg-secondary/20 rounded-xl">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">
                  {currentHoroscope.luckyNumber}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">
                  {currentHoroscope.luckyColor}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-text-primary">
                  {currentHoroscope.compatibility}
                </span>
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="px-4 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedSign}-${activeDay}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {categories.map((category, index) => (
                  <HoroscopeCategoryCard
                    key={category}
                    category={category}
                    prediction={currentHoroscope[category]}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Personalized Reading CTA */}
          <div className="px-4 mt-8">
            <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-secondary/10 border-0">
              <h3 className="font-semibold text-text-primary mb-2">
                Want a Detailed Reading?
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Connect with our expert astrologers for personalized guidance
              </p>
              <a
                href="/browse-chat"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Talk to an Astrologer
              </a>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
