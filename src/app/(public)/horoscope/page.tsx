'use client';

/**
 * Daily Horoscope Page
 * Enhanced 2026 design with:
 * - Zodiac sign selector with subtle hover/active effects
 * - Lucky info displays with colored backgrounds and icons
 * - Prediction sections in card-like containers with borders
 * - Sidebar CTA with gradient glow border
 * - skeleton-shimmer loading states
 * - Improved accessibility with ARIA labels
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZodiacCarousel,
  HoroscopeDayTabs,
  HoroscopeCategoryCard,
  type HoroscopeDay,
  type HoroscopeCategory,
} from '@/components/features/horoscope';
import { ZODIAC_SIGNS, horoscopeService } from '@/lib/services/horoscope.service';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { HeroSection } from '@/components/layout/HeroSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Palette, Hash, Heart, Sparkles, ArrowRight, Star } from 'lucide-react';

// Horoscope data type
interface HoroscopeData {
  general: string;
  love: string;
  career: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
}

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

// Loading skeleton for the horoscope content
function HoroscopeLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-3 skeleton-shimmer" />
          <Skeleton className="h-5 w-64 mx-auto mb-8 skeleton-shimmer" />
          <div className="flex justify-center gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="w-16 h-20 rounded-xl skeleton-shimmer flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl skeleton-shimmer" />
            <Skeleton className="h-14 w-full rounded-xl skeleton-shimmer" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl skeleton-shimmer" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl skeleton-shimmer" />
            <Skeleton className="h-56 w-full rounded-xl skeleton-shimmer" />
            <Skeleton className="h-40 w-full rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [activeDay, setActiveDay] = useState<HoroscopeDay>('today');
  const [apiData, setApiData] = useState<Record<string, HoroscopeData | null>>({});

  // Fetch horoscope from backend when sign or day changes
  useEffect(() => {
    const cacheKey = `${selectedSign}_${activeDay}`;
    if (apiData[cacheKey] !== undefined) return;

    let cancelled = false;

    horoscopeService.getDailyHoroscope(selectedSign, activeDay).then((res) => {
      if (cancelled || !res.data) return;
      const d = res.data;
      const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
      const fallback = generateFallbackHoroscope(sign?.name || 'Your sign', activeDay);
      setApiData((prev) => ({
        ...prev,
        [cacheKey]: {
          general: d.horoscope?.general || d.prediction || fallback.general,
          love: d.horoscope?.love || fallback.love,
          career: d.horoscope?.career || fallback.career,
          health: d.horoscope?.health || fallback.health,
          luckyNumber: d.luckyNumber ?? fallback.luckyNumber,
          luckyColor: d.luckyColor || fallback.luckyColor,
          compatibility: d.compatibility || fallback.compatibility,
        },
      }));
    }).catch(() => {
      if (!cancelled) setApiData((prev) => ({ ...prev, [cacheKey]: null }));
    });

    return () => { cancelled = true; };
  }, [selectedSign, activeDay, apiData]);

  // Get current horoscope data — prefer API data, fallback to generated
  const currentHoroscope = useMemo(() => {
    const cacheKey = `${selectedSign}_${activeDay}`;
    const cached = apiData[cacheKey];
    if (cached && cached.general) return cached;
    const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
    return generateFallbackHoroscope(sign?.name || 'Your sign', activeDay);
  }, [selectedSign, activeDay, apiData]);

  const currentSign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
  const categories: HoroscopeCategory[] = ['general', 'love', 'career', 'health'];

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero Section */}
      <HeroSection
        variant="primary"
        size="sm"
        title="Daily Horoscope"
        subtitle="Discover what the stars have in store for you"
      >
        {/* Zodiac Carousel inside hero */}
        <ZodiacCarousel
          selectedSign={selectedSign}
          onSignChange={setSelectedSign}
        />
      </HeroSection>

      {/* Main Content */}
      <PageContainer size="lg" className="py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day Tabs */}
            <HoroscopeDayTabs
              activeDay={activeDay}
              onDayChange={setActiveDay}
            />

            {/* Lucky Info Bar - Enhanced with colored backgrounds and icons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
              role="region"
              aria-label="Lucky information for today"
            >
              {/* Lucky Number */}
              <div className="flex items-center justify-center gap-2.5 py-3.5 px-3 bg-primary/8 border border-primary/10 rounded-xl hover:bg-primary/12 hover:border-primary/20 transition-all duration-250 group">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-250">
                  <Hash className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-lexend leading-none mb-0.5">Lucky No.</p>
                  <span className="text-sm font-bold text-text-primary font-lexend">
                    {currentHoroscope.luckyNumber}
                  </span>
                </div>
              </div>

              {/* Lucky Color */}
              <div className="flex items-center justify-center gap-2.5 py-3.5 px-3 bg-secondary/10 border border-secondary/15 rounded-xl hover:bg-secondary/15 hover:border-secondary/25 transition-all duration-250 group">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-250">
                  <Palette className="w-4 h-4 text-amber-600" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-lexend leading-none mb-0.5">Color</p>
                  <span className="text-sm font-bold text-text-primary font-lexend">
                    {currentHoroscope.luckyColor}
                  </span>
                </div>
              </div>

              {/* Compatibility */}
              <div className="flex items-center justify-center gap-2.5 py-3.5 px-3 bg-pink-50 border border-pink-100 rounded-xl hover:bg-pink-100/70 hover:border-pink-200 transition-all duration-250 group">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-250">
                  <Heart className="w-4 h-4 text-pink-500" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted font-lexend leading-none mb-0.5">Match</p>
                  <span className="text-sm font-bold text-text-primary font-lexend">
                    {currentHoroscope.compatibility}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Category Cards - Enhanced with card containers and subtle borders */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedSign}-${activeDay}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
                role="region"
                aria-label={`${activeDay}'s horoscope predictions`}
              >
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.3 }}
                  >
                    <div className="bg-white rounded-xl border border-gray-100 hover:border-primary/10 hover:shadow-web-md transition-all duration-300">
                      <HoroscopeCategoryCard
                        category={category}
                        prediction={currentHoroscope[category]}
                        index={index}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personalized Reading CTA - Enhanced with gradient glow border */}
            <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-primary/40 via-secondary/50 to-primary/30 shadow-[0_0_20px_rgba(41,48,166,0.12)] animate-gradient-shift bg-[length:200%_200%]">
              <Card className="p-6 text-center border-0 rounded-[10px] bg-white relative overflow-hidden">
                {/* Subtle sparkle accent */}
                <div className="absolute top-3 right-3 opacity-40">
                  <Sparkles className="w-5 h-5 text-secondary" aria-hidden="true" />
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2 font-lexend">
                  Want a Detailed Reading?
                </h3>
                <p className="text-sm text-text-secondary mb-5 font-nunito">
                  Connect with our expert astrologers for personalized guidance
                </p>
                <a
                  href="/browse-chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 hover:shadow-primary transition-all duration-250 group"
                  aria-label="Talk to an astrologer for a detailed reading"
                >
                  Talk to an Astrologer
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </a>
              </Card>
            </div>

            {/* Sign Info Card - Enhanced with better hover and structure */}
            {currentSign && (
              <motion.div
                key={selectedSign}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Card className="p-6 border border-gray-100 hover:border-primary/10 hover:shadow-web-md transition-all duration-300 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <span className="text-lg" role="img" aria-label={currentSign.name}>
                        {currentSign.symbol || currentSign.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary font-lexend">
                      About {currentSign.name}
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm font-nunito">
                    {[
                      { label: 'Element', value: currentSign.element },
                      { label: 'Date Range', value: currentSign.dateRange },
                      { label: 'Lucky Number', value: currentHoroscope.luckyNumber },
                      { label: 'Lucky Color', value: currentHoroscope.luckyColor },
                      { label: 'Compatibility', value: currentHoroscope.compatibility },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-text-secondary">{item.label}</span>
                        <span className="font-medium text-text-primary">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Kundli CTA - Enhanced with icon and hover effect */}
            <Card className="p-6 border border-gray-100 hover:border-primary/10 hover:shadow-web-md transition-all duration-300 bg-white group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Sparkles className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-text-primary font-lexend">
                  Free Kundli
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-4 font-nunito">
                Generate your detailed Vedic birth chart with planetary positions and predictions.
              </p>
              <a
                href="/kundli"
                className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all duration-250 group/btn"
                aria-label="Generate your free Kundli birth chart"
              >
                Generate Kundli
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
              </a>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
