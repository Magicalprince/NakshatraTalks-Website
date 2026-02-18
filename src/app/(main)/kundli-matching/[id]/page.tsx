'use client';

/**
 * Kundli Matching Report Detail Page
 * Enhanced 2026 design with:
 * - Score gauge with glow effect via drop-shadow filter
 * - Couple info card with subtle gradient background
 * - Guna cards with spring physics expand/collapse
 * - Verdict badge with shadow matching verdict color
 * - Better share button with icon styling
 * - Overall compatibility bar with smooth mount animation
 * - skeleton-shimmer loading states
 * - Improved accessibility
 */

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { MatchingReport } from '@/types/api.types';

// Ashtakoot Guna data structure
interface GunaItem {
  id: string;
  name: string;
  maxPoints: number;
  obtainedPoints: number;
  description: string;
  boyAttribute: string;
  girlAttribute: string;
  verdict: 'excellent' | 'good' | 'average' | 'poor';
}

// Extended matching type
interface SavedMatching extends MatchingReport {
  boy: { name: string; dateOfBirth: string };
  girl: { name: string; dateOfBirth: string };
  score: number;
}

// Fallback Ashtakoot data
function generateFallbackAshtakootData(totalScore: number): GunaItem[] {
  return [
    {
      id: 'varna', name: 'Varna', maxPoints: 1,
      obtainedPoints: totalScore >= 20 ? 1 : 0,
      description: 'Varna refers to the mental compatibility of the two persons involved.',
      boyAttribute: 'Brahmin', girlAttribute: 'Kshatriya',
      verdict: totalScore >= 20 ? 'excellent' : 'average',
    },
    {
      id: 'vashya', name: 'Vashya', maxPoints: 2,
      obtainedPoints: totalScore >= 18 ? 2 : totalScore >= 12 ? 1 : 0,
      description: 'Vashya indicates the power equation and mutual attraction between partners.',
      boyAttribute: 'Manav', girlAttribute: 'Manav',
      verdict: totalScore >= 18 ? 'excellent' : totalScore >= 12 ? 'good' : 'poor',
    },
    {
      id: 'tara', name: 'Tara', maxPoints: 3,
      obtainedPoints: totalScore >= 25 ? 3 : totalScore >= 18 ? 2 : 1,
      description: 'Tara represents the birth star compatibility and indicates health and well-being.',
      boyAttribute: 'Ashwini', girlAttribute: 'Rohini',
      verdict: totalScore >= 25 ? 'excellent' : totalScore >= 18 ? 'good' : 'average',
    },
    {
      id: 'yoni', name: 'Yoni', maxPoints: 4,
      obtainedPoints: totalScore >= 28 ? 4 : totalScore >= 20 ? 3 : totalScore >= 15 ? 2 : 1,
      description: 'Yoni represents physical and sexual compatibility between partners.',
      boyAttribute: 'Horse', girlAttribute: 'Elephant',
      verdict: totalScore >= 28 ? 'excellent' : totalScore >= 20 ? 'good' : 'average',
    },
    {
      id: 'graha_maitri', name: 'Maitri', maxPoints: 5,
      obtainedPoints: totalScore >= 26 ? 5 : totalScore >= 20 ? 4 : totalScore >= 15 ? 3 : 2,
      description: 'Maitri assesses the mental compatibility and mutual love between partners.',
      boyAttribute: 'Mars', girlAttribute: 'Venus',
      verdict: totalScore >= 26 ? 'excellent' : totalScore >= 20 ? 'good' : 'average',
    },
    {
      id: 'gana', name: 'Gana', maxPoints: 6,
      obtainedPoints: totalScore >= 30 ? 6 : totalScore >= 24 ? 5 : totalScore >= 18 ? 4 : 2,
      description: 'Gana represents the temperament and behavior compatibility in daily life.',
      boyAttribute: 'Deva', girlAttribute: 'Manushya',
      verdict: totalScore >= 30 ? 'excellent' : totalScore >= 24 ? 'good' : 'average',
    },
    {
      id: 'bhakoot', name: 'Bhakoot', maxPoints: 7,
      obtainedPoints: totalScore >= 32 ? 7 : totalScore >= 25 ? 5 : totalScore >= 18 ? 3 : 0,
      description: "Bhakoot assesses the couple's wealth and health after marriage.",
      boyAttribute: 'Aries', girlAttribute: 'Leo',
      verdict: totalScore >= 32 ? 'excellent' : totalScore >= 25 ? 'good' : totalScore >= 18 ? 'average' : 'poor',
    },
    {
      id: 'nadi', name: 'Nadi', maxPoints: 8,
      obtainedPoints: totalScore >= 28 ? 8 : totalScore >= 20 ? 4 : 0,
      description: 'Nadi is related to the health of the couple and their future children.',
      boyAttribute: 'Madhya', girlAttribute: 'Antya',
      verdict: totalScore >= 28 ? 'excellent' : totalScore >= 20 ? 'average' : 'poor',
    },
  ];
}

// Mock data
const MOCK_MATCHINGS: SavedMatching[] = [
  {
    id: 'matching-1', totalPoints: 28, maxPoints: 36, percentage: 78,
    categories: {}, recommendation: 'Good match with minor adjustments needed.',
    createdAt: '2024-01-15T10:00:00.000Z',
    boy: { name: 'Rahul Kumar', dateOfBirth: '1990-05-15' },
    girl: { name: 'Priya Sharma', dateOfBirth: '1992-08-22' }, score: 28,
  },
  {
    id: 'matching-2', totalPoints: 32, maxPoints: 36, percentage: 89,
    categories: {}, recommendation: 'Excellent match! Highly compatible.',
    createdAt: '2024-01-10T08:30:00.000Z',
    boy: { name: 'Amit Singh', dateOfBirth: '1988-12-03' },
    girl: { name: 'Neha Patel', dateOfBirth: '1991-04-18' }, score: 32,
  },
  {
    id: 'matching-3', totalPoints: 18, maxPoints: 36, percentage: 50,
    categories: {}, recommendation: 'Average match. Remedies suggested.',
    createdAt: '2024-01-05T15:20:00.000Z',
    boy: { name: 'Vikram Reddy', dateOfBirth: '1993-07-25' },
    girl: { name: 'Kavya Menon', dateOfBirth: '1995-11-12' }, score: 18,
  },
];

function getVerdict(score: number) {
  if (score >= 25) return {
    text: 'Excellent Match',
    color: 'text-green-600',
    bg: 'bg-green-100',
    barColor: 'bg-green-500',
    shadowColor: 'shadow-[0_4px_14px_rgba(34,197,94,0.3)]',
    glowFilter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))',
    strokeColor: '#22C55E',
  };
  if (score >= 18) return {
    text: 'Good Match',
    color: 'text-lime-600',
    bg: 'bg-lime-100',
    barColor: 'bg-lime-500',
    shadowColor: 'shadow-[0_4px_14px_rgba(132,204,22,0.3)]',
    glowFilter: 'drop-shadow(0 0 8px rgba(132,204,22,0.4))',
    strokeColor: '#84CC16',
  };
  if (score >= 12) return {
    text: 'Average Match',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    barColor: 'bg-amber-500',
    shadowColor: 'shadow-[0_4px_14px_rgba(245,158,11,0.3)]',
    glowFilter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))',
    strokeColor: '#F59E0B',
  };
  return {
    text: 'Below Average',
    color: 'text-red-600',
    bg: 'bg-red-100',
    barColor: 'bg-red-500',
    shadowColor: 'shadow-[0_4px_14px_rgba(239,68,68,0.3)]',
    glowFilter: 'drop-shadow(0 0 8px rgba(239,68,68,0.4))',
    strokeColor: '#EF4444',
  };
}

function getVerdictColor(verdict: string) {
  switch (verdict) {
    case 'excellent': return { color: 'text-green-600', bg: 'bg-green-100', ring: 'stroke-green-500', border: 'border-green-200' };
    case 'good': return { color: 'text-lime-600', bg: 'bg-lime-100', ring: 'stroke-lime-500', border: 'border-lime-200' };
    case 'average': return { color: 'text-amber-600', bg: 'bg-amber-100', ring: 'stroke-amber-500', border: 'border-amber-200' };
    case 'poor': return { color: 'text-red-600', bg: 'bg-red-100', ring: 'stroke-red-500', border: 'border-red-200' };
    default: return { color: 'text-gray-600', bg: 'bg-gray-100', ring: 'stroke-gray-500', border: 'border-gray-200' };
  }
}

function ScoreRing({ obtained, max, verdict }: { obtained: number; max: number; verdict: string }) {
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (obtained / max) * circumference;
  const colors = getVerdictColor(verdict);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-gray-100" strokeWidth={strokeWidth} fill="transparent" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          className={colors.ring} strokeWidth={strokeWidth} fill="transparent"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-semibold font-lexend ${colors.color}`}>{obtained}/{max}</span>
      </div>
    </div>
  );
}

function GunaCard({ guna, index }: { guna: GunaItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getVerdictColor(guna.verdict);

  const VerdictIcon = () => {
    switch (guna.verdict) {
      case 'excellent':
      case 'good':
        return <Check className={`w-3.5 h-3.5 ${colors.color}`} aria-hidden="true" />;
      case 'average':
        return <AlertCircle className={`w-3.5 h-3.5 ${colors.color}`} aria-hidden="true" />;
      case 'poor':
        return <X className={`w-3.5 h-3.5 ${colors.color}`} aria-hidden="true" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Card
        className="p-4 cursor-pointer border border-gray-100 hover:border-primary/10 hover:shadow-web-md transition-all duration-300"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${guna.name}: ${guna.obtainedPoints} out of ${guna.maxPoints} points, ${guna.verdict}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-text-primary font-lexend">{guna.name}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${colors.bg} ${colors.border} border`}>
                <VerdictIcon />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${colors.color}`}>
                  {guna.verdict}
                </span>
              </span>
            </div>
            <p className={`text-sm text-text-secondary font-nunito mt-1.5 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {guna.description}
            </p>
          </div>
          <ScoreRing obtained={guna.obtainedPoints} max={guna.maxPoints} verdict={guna.verdict} />
        </div>

        {/* Expanded Content with spring physics */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { type: 'spring', stiffness: 400, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-0 bg-gradient-to-r from-primary/5 to-pink-50 rounded-xl overflow-hidden">
                  <div className="text-center py-4 px-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs font-bold text-primary font-lexend">M</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-lexend mb-1">
                      Boy&apos;s {guna.name}
                    </p>
                    <p className="text-sm font-semibold text-primary font-lexend">{guna.boyAttribute}</p>
                  </div>
                  <div className="text-center py-4 px-3 border-l border-white/60">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xs font-bold text-pink-500 font-lexend">F</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-lexend mb-1">
                      Girl&apos;s {guna.name}
                    </p>
                    <p className="text-sm font-semibold text-pink-500 font-lexend">{guna.girlAttribute}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand indicator with rotation */}
        <div className="flex justify-center mt-2.5">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="w-4 h-4 text-text-muted" aria-hidden="true" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function KundliMatchingReportPage() {
  const params = useParams();
  const matchingId = params.id as string;
  const [shareSuccess, setShareSuccess] = useState(false);
  const [barMounted, setBarMounted] = useState(false);

  // Trigger bar animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setBarMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch matching data
  const { data: matchingData, isLoading } = useQuery({
    queryKey: ['matching', 'detail', matchingId],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mock = MOCK_MATCHINGS.find((m) => m.id === matchingId) || MOCK_MATCHINGS[0];
        return mock;
      }
      const response = await kundliService.getMatchingById(matchingId);
      return response.data as SavedMatching;
    },
    enabled: !!matchingId,
  });

  const matching = matchingData;
  const score = matching?.score || matching?.totalPoints || 0;
  const maxScore = 36;
  const percentage = Math.round((score / maxScore) * 100);
  const verdict = getVerdict(score);

  // Generate ashtakoot gunas
  const gunas = useMemo(() => {
    return generateFallbackAshtakootData(score);
  }, [score]);

  const handleShare = async () => {
    if (!matching) return;
    const shareText = `Kundli Matching Report\n${matching.boy.name} & ${matching.girl.name}\nCompatibility Score: ${score}/36\nVerdict: ${verdict.text}\n\nGenerated by NakshatraTalks`;

    try {
      await navigator.share({
        title: 'Kundli Matching Report',
        text: shareText,
      });
    } catch {
      // fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        // silently fail
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 skeleton-shimmer" />
            <Skeleton className="w-64 h-8 mb-8 skeleton-shimmer" />
            <div className="rounded-xl overflow-hidden">
              <Skeleton className="h-56 rounded-xl mb-6 skeleton-shimmer" />
            </div>
            <Skeleton className="h-16 rounded-xl mb-6 skeleton-shimmer" />
            <Skeleton className="h-5 w-48 mb-2 skeleton-shimmer" />
            <Skeleton className="h-4 w-36 mb-4 skeleton-shimmer" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!matching) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="sm">
          <div className="text-center py-16">
            <motion.div
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
            </motion.div>
            <h2 className="text-lg font-semibold text-text-primary mb-2 font-lexend">Report Not Found</h2>
            <p className="text-text-secondary mb-4 font-nunito">Unable to load this matching report.</p>
            <Link href="/saved-matchings">
              <Button variant="primary">Go to Saved Matchings</Button>
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Saved Matchings', href: '/saved-matchings' },
            { label: 'Report' },
          ]}
        />

        {/* Score Header Card - Enhanced with gradient background and glow gauge */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/8 via-secondary/8 to-pink-50/50 border border-primary/10 overflow-hidden relative">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            {/* Score Gauge with glow effect */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
              style={{ filter: verdict.glowFilter }}
            >
              <svg width={140} height={140} role="img" aria-label={`Compatibility score: ${score} out of ${maxScore}`}>
                <circle cx={70} cy={70} r={60} className="stroke-gray-200" strokeWidth={10} fill="white" />
                <motion.circle
                  cx={70} cy={70} r={60}
                  stroke={verdict.strokeColor}
                  strokeWidth={10} fill="transparent"
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  initial={{ strokeDasharray: `0 ${2 * Math.PI * 60}` }}
                  animate={{
                    strokeDasharray: `${(score / maxScore) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`,
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold text-text-primary font-lexend"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                >
                  {score}
                </motion.span>
                <span className="text-xs text-text-secondary font-lexend">out of {maxScore}</span>
              </div>
            </motion.div>

            {/* Couple Info - Enhanced */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <motion.div
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-3 ring-white shadow-sm"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-white font-semibold font-lexend">{matching.boy.name.charAt(0)}</span>
                </motion.div>
                <motion.div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center ring-3 ring-white shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
                >
                  <Heart className="w-4 h-4 text-white" fill="white" aria-hidden="true" />
                </motion.div>
                <motion.div
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center ring-3 ring-white shadow-sm"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-white font-semibold font-lexend">{matching.girl.name.charAt(0)}</span>
                </motion.div>
              </div>

              <motion.h1
                className="text-xl font-bold text-text-primary font-lexend mb-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {matching.boy.name} & {matching.girl.name}
              </motion.h1>

              {/* Verdict Badge with matching shadow */}
              <motion.span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${verdict.bg} ${verdict.color} ${verdict.shadowColor} text-sm font-semibold font-lexend`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 200 }}
              >
                <Star className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true" />
                {verdict.text}
              </motion.span>

              {/* Action Buttons - Enhanced share button */}
              <motion.div
                className="flex items-center gap-3 mt-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all relative"
                  aria-label="Share this matching report"
                >
                  <AnimatePresence mode="wait">
                    {shareSuccess ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                        <span className="text-green-600">Copied!</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="share"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4" aria-hidden="true" />
                        Share Report
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
                <Link href="/browse-chat">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-primary hover:shadow-[0_6px_20px_rgba(41,48,166,0.3)] transition-all">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Consult Astrologer
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </Card>

        {/* Overall Compatibility - Enhanced with smooth mount animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary font-lexend">Overall Compatibility</h3>
              <motion.span
                className={`text-lg font-bold font-lexend ${verdict.color}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              >
                {percentage}%
              </motion.span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: barMounted ? `${percentage}%` : '0%' }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                className={`h-full rounded-full ${verdict.barColor} relative`}
              >
                {/* Shimmer effect on bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skeleton-shimmer" />
              </motion.div>
            </div>
            {/* Score label markers */}
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-text-muted font-nunito">0</span>
              <span className="text-[10px] text-text-muted font-nunito">18 (Avg)</span>
              <span className="text-[10px] text-text-muted font-nunito">36</span>
            </div>
          </Card>
        </motion.div>

        {/* Ashtakoot Analysis */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-text-primary font-lexend">Ashtakoot Analysis</h2>
            <span className="px-2 py-0.5 bg-primary/8 text-primary text-[10px] font-semibold rounded-md font-lexend uppercase tracking-wide">
              8 Gunas
            </span>
          </div>
          <p className="text-sm text-text-secondary font-nunito mb-4">
            Detailed breakdown of the 8 Guna Milan points
          </p>

          <div className="space-y-3">
            {gunas.map((guna, index) => (
              <GunaCard key={guna.id} guna={guna} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Disclaimer - Enhanced */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-4 mb-8 bg-amber-50/50 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-800 font-lexend mb-0.5">Disclaimer</p>
                <p className="text-xs text-amber-700/80 font-nunito leading-relaxed">
                  This report is for educational and entertainment purposes. Please consult a qualified astrologer for detailed analysis and personalized recommendations.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </PageContainer>
    </div>
  );
}
