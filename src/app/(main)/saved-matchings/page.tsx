'use client';

/**
 * Kundli Matching Dashboard Page
 * Enhanced 2026 design with:
 * - card-hover-lift effect on matching cards
 * - Score badges with glow effect based on score color
 * - Consistent search input styling
 * - Better empty state illustration and CTA
 * - Inline delete confirmation with AnimatePresence (replaces modal)
 * - skeleton-shimmer loading states
 * - Improved accessibility
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  Plus,
  Heart,
  Trash2,
  MoreVertical,
  X,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Skeleton, Modal } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUIStore } from '@/stores/ui-store';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { MatchingReport } from '@/types/api.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// Extended matching type with additional fields
interface SavedMatching extends MatchingReport {
  boy: { name: string; dateOfBirth: string };
  girl: { name: string; dateOfBirth: string };
  score: number;
}

// Mock Matching data for development
const MOCK_MATCHINGS: SavedMatching[] = [
  {
    id: 'matching-1',
    totalPoints: 28,
    maxPoints: 36,
    percentage: 78,
    categories: {},
    recommendation: 'Good match with minor adjustments needed.',
    createdAt: '2024-01-15T10:00:00.000Z',
    boy: { name: 'Rahul Kumar', dateOfBirth: '1990-05-15' },
    girl: { name: 'Priya Sharma', dateOfBirth: '1992-08-22' },
    score: 28,
  },
  {
    id: 'matching-2',
    totalPoints: 32,
    maxPoints: 36,
    percentage: 89,
    categories: {},
    recommendation: 'Excellent match! Highly compatible.',
    createdAt: '2024-01-10T08:30:00.000Z',
    boy: { name: 'Amit Singh', dateOfBirth: '1988-12-03' },
    girl: { name: 'Neha Patel', dateOfBirth: '1991-04-18' },
    score: 32,
  },
  {
    id: 'matching-3',
    totalPoints: 18,
    maxPoints: 36,
    percentage: 50,
    categories: {},
    recommendation: 'Average match. Remedies suggested.',
    createdAt: '2024-01-05T15:20:00.000Z',
    boy: { name: 'Vikram Reddy', dateOfBirth: '1993-07-25' },
    girl: { name: 'Kavya Menon', dateOfBirth: '1995-11-12' },
    score: 18,
  },
];

// Get initials from name
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// Get score color - enhanced with glow shadow values
const getScoreColor = (score: number): {
  bg: string;
  text: string;
  glow: string;
  border: string;
} => {
  if (score >= 25) return {
    bg: 'bg-green-100',
    text: 'text-green-600',
    glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    border: 'border-green-200',
  };
  if (score >= 18) return {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    border: 'border-amber-200',
  };
  return {
    bg: 'bg-red-100',
    text: 'text-red-600',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
    border: 'border-red-200',
  };
};

interface MatchingCardProps {
  matching: SavedMatching;
  index: number;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function MatchingCard({
  matching,
  index,
  onPress,
  onDelete,
  isDeleting,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: MatchingCardProps) {
  const scoreColors = getScoreColor(matching.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      layout
      className="mb-3"
    >
      <Card
        className="p-0 border border-gray-100 hover:border-primary/15 transition-all duration-300 card-hover-lift overflow-hidden"
      >
        {/* Main card content */}
        <div
          className="p-4 cursor-pointer"
          onClick={onPress}
          role="button"
          tabIndex={0}
          aria-label={`View matching report for ${matching.boy.name} and ${matching.girl.name}, score ${matching.score} out of 36`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(); } }}
        >
          <div className="flex items-center">
            {/* Avatars with Heart */}
            <div className="flex items-center -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center z-10 ring-2 ring-white">
                <span className="text-white font-semibold text-sm font-lexend">
                  {getInitials(matching.boy.name)}
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center z-20 ring-2 ring-white">
                <Heart className="w-3 h-3 text-white" fill="white" aria-hidden="true" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center z-10 ring-2 ring-white">
                <span className="text-white font-semibold text-sm font-lexend">
                  {getInitials(matching.girl.name)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 ml-4 min-w-0">
              <p className="font-semibold text-text-primary truncate font-lexend text-[15px]">
                {matching.boy.name} & {matching.girl.name}
              </p>
              <p className="text-xs text-text-muted font-nunito mt-0.5">
                {new Date(matching.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>

            {/* Score Badge with glow effect */}
            {matching.score > 0 && (
              <div
                className={`px-3 py-1.5 rounded-full ${scoreColors.bg} ${scoreColors.border} border ${scoreColors.glow} mr-2`}
              >
                <span className={`text-xs font-bold ${scoreColors.text} font-lexend`}>
                  {matching.score}/36
                </span>
              </div>
            )}

            {/* Delete action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-red-50 rounded-full transition-colors group"
              aria-label={`Delete matching report for ${matching.boy.name} and ${matching.girl.name}`}
            >
              <Trash2 className="w-4 h-4 text-text-muted group-hover:text-red-500 transition-colors" />
            </button>

            <ChevronRight className="w-5 h-5 text-text-muted ml-1" aria-hidden="true" />
          </div>
        </div>

        {/* Inline delete confirmation - replaces modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-700 font-nunito flex-1">
                    Delete this matching report? This cannot be undone.
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onCancelDelete(); }}
                      className="px-3 py-1.5 text-xs font-medium text-text-secondary bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onConfirmDelete(); }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-4 mb-3 border border-gray-100">
      <div className="flex items-center">
        <div className="flex items-center -space-x-2">
          <Skeleton className="w-10 h-10 rounded-full skeleton-shimmer" />
          <Skeleton className="w-6 h-6 rounded-full skeleton-shimmer" />
          <Skeleton className="w-10 h-10 rounded-full skeleton-shimmer" />
        </div>
        <div className="flex-1 ml-4">
          <Skeleton className="w-44 h-5 mb-1.5 skeleton-shimmer" />
          <Skeleton className="w-28 h-3.5 skeleton-shimmer" />
        </div>
        <Skeleton className="w-16 h-7 rounded-full skeleton-shimmer" />
      </div>
    </Card>
  );
}

function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Illustrated empty state */}
      <div className="relative mb-6">
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-pink-100 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <HeartHandshake className="w-12 h-12 text-primary/60" aria-hidden="true" />
        </motion.div>
        {/* Decorative dots */}
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary/30"
          animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-pink-200"
          animate={{ y: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <h3 className="text-xl font-bold text-text-primary font-lexend mb-2">
        No Matching Reports Yet
      </h3>
      <p className="text-sm text-text-secondary text-center mt-1 max-w-xs font-nunito leading-relaxed">
        Create your first Kundli matching report to discover compatibility between two people.
      </p>
      <Button
        onClick={onCreatePress}
        className="mt-6 gap-2 h-11 px-6 shadow-primary hover:shadow-[0_6px_20px_rgba(41,48,166,0.3)] transition-all"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
        Create Your First Report
      </Button>
    </motion.div>
  );
}

export default function KundliMatchingDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Auth check
  const { isReady } = useRequireAuth();

  // Fetch matchings
  const { data: matchingsData, isLoading: isMatchingsLoading } = useQuery({
    queryKey: ['matchings'],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true, data: MOCK_MATCHINGS };
      }
      const response = await kundliService.getMatchingList();
      return response;
    },
    enabled: isReady,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (matchingId: string) => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
      }
      return kundliService.deleteMatching(matchingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Matching report deleted successfully',
      });
      setDeleteConfirmId(null);
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete matching report',
      });
    },
  });

  const matchings = (matchingsData?.data as SavedMatching[]) || [];

  // Filter matchings based on search
  const filteredMatchings = useMemo(() => {
    if (!searchQuery.trim()) return matchings;
    const query = searchQuery.toLowerCase();
    return matchings.filter(
      (m) =>
        m.boy.name.toLowerCase().includes(query) ||
        m.girl.name.toLowerCase().includes(query)
    );
  }, [matchings, searchQuery]);

  const handleCardPress = useCallback(
    (matching: SavedMatching) => {
      router.push(`/kundli-matching/${matching.id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((matchingId: string) => {
    setDeleteConfirmId(matchingId);
  }, []);

  const handleConfirmDelete = useCallback((matchingId: string) => {
    deleteMutation.mutate(matchingId);
  }, [deleteMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push('/kundli-matching/create');
  }, [router]);

  const isLoading = !isReady || isMatchingsLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 skeleton-shimmer" />
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="w-44 h-8 skeleton-shimmer" />
              <Skeleton className="w-32 h-10 rounded-lg skeleton-shimmer" />
            </div>
            <Skeleton className="w-64 h-4 mb-6 skeleton-shimmer" />
            <Skeleton className="h-12 rounded-xl mb-6 skeleton-shimmer" />
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Saved Matchings' },
          ]}
        />

        {/* Page Title */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary font-lexend">
              Kundli Matching
            </h1>
          </div>
          {(matchings.length > 0 || searchQuery) && (
            <Button
              onClick={handleCreateNew}
              className="gap-2 shadow-sm hover:shadow-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Matching
            </Button>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-6 font-nunito ml-[52px]">
          View and manage your compatibility reports
        </p>

        {/* Search Bar - consistent styling with other pages */}
        <div className="mb-6">
          <div className="flex items-center bg-white rounded-xl px-4 h-12 border border-gray-200 focus-within:border-primary/30 focus-within:shadow-[0_0_0_3px_rgba(41,48,166,0.08)] transition-all duration-250">
            <Search className="w-5 h-5 text-text-muted flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent ml-3 outline-none text-sm font-nunito text-text-primary placeholder:text-text-muted"
              aria-label="Search saved matching reports by name"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="pb-8">
          <AnimatePresence mode="popLayout">
            {filteredMatchings.length === 0 && !searchQuery ? (
              <EmptyState onCreatePress={handleCreateNew} />
            ) : filteredMatchings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-text-muted" aria-hidden="true" />
                </div>
                <p className="text-text-secondary font-nunito">
                  No results found for &quot;{searchQuery}&quot;
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary text-sm font-medium mt-2 hover:underline"
                >
                  Clear search
                </button>
              </motion.div>
            ) : (
              filteredMatchings.map((matching, index) => (
                <MatchingCard
                  key={matching.id}
                  matching={matching}
                  index={index}
                  onPress={() => handleCardPress(matching)}
                  onDelete={() => handleDeleteClick(matching.id)}
                  isDeleting={deleteMutation.isPending && deleteConfirmId === matching.id}
                  showDeleteConfirm={deleteConfirmId === matching.id}
                  onConfirmDelete={() => handleConfirmDelete(matching.id)}
                  onCancelDelete={handleCancelDelete}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </PageContainer>
    </div>
  );
}
